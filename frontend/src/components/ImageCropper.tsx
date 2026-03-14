"use client";

import { useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Crop, ScanSearch } from "lucide-react";
import { ScannerButton } from "@/components/ui/ScannerButton";
import { getCroppedImage } from "@/lib/imageCrop";
import "react-easy-crop/react-easy-crop.css";

type ImageCropperProps = {
  imageSrc: string;
  onConfirm: (file: File) => Promise<void> | void;
  onCropAndScan: (file: File) => Promise<void> | void;
  loading?: boolean;
};

export function ImageCropper({
  imageSrc,
  onConfirm,
  onCropAndScan,
  loading = false,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropBoxScale, setCropBoxScale] = useState(78);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState<"confirm" | "scan" | null>(null);

  const cropSize = useMemo(
    () => ({
      width: Math.round(430 * (cropBoxScale / 100)),
      height: Math.round(270 * (cropBoxScale / 100)),
    }),
    [cropBoxScale],
  );

  async function withCroppedFile(action: "confirm" | "scan") {
    if (!croppedAreaPixels) return;

    setBusy(action);
    try {
      const file = await getCroppedImage(imageSrc, croppedAreaPixels);
      if (action === "confirm") {
        await onConfirm(file);
      } else {
        await onCropAndScan(file);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="glass-panel border border-[rgba(125,249,255,0.25)] p-4 md:p-5">
      <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-[#7df9ff]">
        <Crop className="h-3.5 w-3.5" />
        <span>CROP SCAM MESSAGE AREA</span>
      </div>

      <div className="relative h-[340px] w-full overflow-hidden rounded border border-[rgba(125,249,255,0.25)] bg-[rgba(8,11,20,0.9)] md:h-[400px]">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={16 / 10}
          cropSize={cropSize}
          showGrid
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="rounded border border-[rgba(125,249,255,0.2)] bg-[rgba(125,249,255,0.05)] p-3">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-[#6b7280]">
            <span>ZOOM</span>
            <span className="text-[#7df9ff]">{zoom.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[#00f0ff]"
          />
        </label>

        <label className="rounded border border-[rgba(125,249,255,0.2)] bg-[rgba(125,249,255,0.05)] p-3">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-[#6b7280]">
            <span>CROP BOX SIZE</span>
            <span className="text-[#7df9ff]">{cropBoxScale}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={1}
            value={cropBoxScale}
            onChange={(e) => setCropBoxScale(Number(e.target.value))}
            className="w-full accent-[#00f0ff]"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <ScannerButton
          onClick={() => withCroppedFile("confirm")}
          disabled={!croppedAreaPixels || loading || busy !== null}
          loading={busy === "confirm"}
          variant="cyan"
        >
          <Crop className="h-4 w-4" />
          {busy === "confirm" ? "Cropping..." : "Confirm Crop"}
        </ScannerButton>

        <ScannerButton
          onClick={() => withCroppedFile("scan")}
          disabled={!croppedAreaPixels || loading || busy !== null}
          loading={loading || busy === "scan"}
          variant="magenta"
        >
          <ScanSearch className="h-4 w-4" />
          {loading || busy === "scan" ? "Scanning..." : "Crop & Scan"}
        </ScannerButton>
      </div>
    </div>
  );
}
