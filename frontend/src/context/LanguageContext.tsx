"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { LanguageCode } from "@/types";
import { LanguageSelectorModal } from "@/components/LanguageSelectorModal";

const STORAGE_KEY = "preferred_language";

interface LanguageContextType {
  language: LanguageCode;
  initialized: boolean;
  translating: boolean;
  setLanguage: (language: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en-US",
  initialized: false,
  translating: false,
  setLanguage: () => {},
});

// Module-level caches survive re-renders and are shared across the tree.
const translationCache = new Map<string, string>();
const originalNodeText = new WeakMap<Text, string>();

const SELECTABLE_LANGUAGES: LanguageCode[] = [
  "en-US",
  "fr-CA",
  "es-ES",
  "yo-NG",
  "ha-NG",
  "ig-NG",
  "ta-IN",
  "en-PT",
];

// MutationObserver config — watch for any DOM changes React might make.
const OBSERVER_OPTIONS: MutationObserverInit = {
  childList: true,
  subtree: true,
  characterData: true,
};

// Debounce: re-translation triggered by the observer is batched so a burst of
// React reconciliation mutations results in a single translation pass.
function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number,
): T {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

function isSupportedLanguage(value: string | null): value is LanguageCode {
  return value !== null && SELECTABLE_LANGUAGES.includes(value as LanguageCode);
}

function isTranslatableTextNode(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return false;
  const trimmed = node.textContent?.trim() ?? "";
  if (trimmed.length < 2) return false;
  if (
    parent.closest(
      "[data-no-translate], script, style, code, textarea, input, select, option",
    )
  ) {
    return false;
  }
  return true;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en-US");
  const [initialized, setInitialized] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Refs so async callbacks always read the latest values without stale closures.
  const observerRef = useRef<MutationObserver | null>(null);
  const languageRef = useRef<LanguageCode>("en-US");
  const isApplyingRef = useRef(false);

  // ── Core translation pass ─────────────────────────────────
  // showSpinner=true  → first translation after a language change (user-visible)
  // showSpinner=false → silent re-application after a React re-render wipes the DOM
  const applyTranslations = useCallback(
    async (targetLanguage: LanguageCode, showSpinner: boolean) => {
      // Prevent concurrent runs — React re-renders fire many mutations.
      if (isApplyingRef.current) return;
      isApplyingRef.current = true;
      if (showSpinner) setTranslating(true);

      // Pause the observer so our own DOM writes don't trigger it again.
      observerRef.current?.disconnect();

      try {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
        );
        const textNodes: Text[] = [];
        let cur = walker.nextNode();
        while (cur) {
          if (isTranslatableTextNode(cur as Text)) textNodes.push(cur as Text);
          cur = walker.nextNode();
        }

        // Restoring English: put back every node's saved original.
        if (targetLanguage === "en-US") {
          textNodes.forEach((node) => {
            const original = originalNodeText.get(node);
            if (original !== undefined) node.textContent = original;
          });
          document.documentElement.lang = "en";
          return;
        }

        // Snapshot originals BEFORE the async API call so the WeakMap entries
        // are correct even if React mutates the nodes mid-flight.
        const originals = textNodes.map((node) => {
          const original = originalNodeText.get(node) ?? node.textContent ?? "";
          if (!originalNodeText.has(node)) originalNodeText.set(node, original);
          return original;
        });

        // Only hit the API for strings not already in cache.
        const missingTexts = Array.from(new Set(originals)).filter(
          (text) => !translationCache.has(`${targetLanguage}::${text}`),
        );

        if (missingTexts.length > 0) {
          const results = await api.translateUiTexts(
            missingTexts,
            targetLanguage,
          );
          missingTexts.forEach((text, i) => {
            translationCache.set(
              `${targetLanguage}::${text}`,
              results[i] ?? text,
            );
          });
        }

        // Pause again — the async gap above could have re-enabled the observer.
        observerRef.current?.disconnect();

        // Write translations into the DOM.
        textNodes.forEach((node, i) => {
          const translated =
            translationCache.get(`${targetLanguage}::${originals[i]}`) ??
            originals[i];
          node.textContent = translated;
        });

        document.documentElement.lang = targetLanguage;
      } catch (err) {
        console.error("[language] translation failed", err);
      } finally {
        isApplyingRef.current = false;
        if (showSpinner) setTranslating(false);

        // Re-enable observer so subsequent React re-renders are caught.
        if (languageRef.current !== "en-US" && observerRef.current) {
          observerRef.current.observe(document.body, OBSERVER_OPTIONS);
        }
      }
    },
    [],
  );

  // ── Bootstrap: read localStorage ─────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    queueMicrotask(() => {
      if (isSupportedLanguage(stored)) {
        setLanguageState(stored);
        languageRef.current = stored;
        setShowModal(false);
      } else {
        setShowModal(true);
      }
      setInitialized(true);
    });
  }, []);

  // ── Run translation whenever language or initialized state changes ──
  useEffect(() => {
    if (!initialized) return;

    // Tear down old observer before building a new one for this language.
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (language !== "en-US") {
      // Silent re-translation triggered by React DOM reconciliation.
      // Debounced so a burst of mutations results in a single pass.
      const reapply = debounce(() => {
        if (!isApplyingRef.current) {
          void applyTranslations(languageRef.current, false);
        }
      }, 200);

      observerRef.current = new MutationObserver(reapply);
      // Note: the observer is NOT started here — applyTranslations starts it
      // after it finishes writing, to avoid observing its own mutations.
    }

    void applyTranslations(language, true);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [initialized, language, applyTranslations]);

  const setLanguage = useCallback((nextLanguage: LanguageCode) => {
    languageRef.current = nextLanguage;
    setLanguageState(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
  }, []);

  const confirmFromModal = useCallback(
    (nextLanguage: LanguageCode) => {
      setLanguage(nextLanguage);
      setShowModal(false);
    },
    [setLanguage],
  );

  const contextValue = useMemo(
    () => ({ language, initialized, translating, setLanguage }),
    [initialized, language, translating, setLanguage],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}

      {/* Spinner overlay — shown only during the initial translation pass */}
      {translating && (
        <div
          className="fixed inset-0 z-[96] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          aria-live="polite"
          aria-label="Translating page content"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7df9ff] border-t-transparent" />
            <span className="font-mono text-xs tracking-widest text-[#7df9ff]">
              TRANSLATING...
            </span>
          </div>
        </div>
      )}

      {/* Dim overlay while reading localStorage on first load */}
      {!initialized && <div className="fixed inset-0 z-[95] bg-black/60" />}

      {/* Language picker — only shown on first visit */}
      <LanguageSelectorModal
        open={initialized && showModal}
        defaultLanguage={language}
        onConfirm={confirmFromModal}
      />
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
