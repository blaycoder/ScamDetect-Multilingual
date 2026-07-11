import { api } from "@/lib/api";
import type { CommunitySignal, DetectionResult } from "@/types";

/** Fetch and aggregate approved community reports for the given values. */
export async function attachCommunitySignal(
  result: DetectionResult,
  extraValues: string[] = [],
): Promise<DetectionResult> {
  const values = Array.from(
    new Set(
      [...extraValues, ...result.extractedUrls]
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ).slice(0, 3);

  if (values.length === 0) return result;

  try {
    const checks = await Promise.all(
      values.map((value) =>
        api.checkCommunityReports(value).catch(() => ({
          reportCount: 0,
          reportTypes: [] as string[],
        })),
      ),
    );

    let reportCount = 0;
    const typeSet = new Set<string>();
    for (const check of checks) {
      reportCount += check.reportCount;
      check.reportTypes.forEach((t) => typeSet.add(t));
    }

    if (reportCount === 0) return result;

    const communitySignal: CommunitySignal = {
      reportCount,
      reportTypes: Array.from(typeSet),
    };

    return { ...result, communitySignal };
  } catch {
    return result;
  }
}
