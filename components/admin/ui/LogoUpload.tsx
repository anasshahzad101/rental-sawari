"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Button, Spinner } from "./Button";
import { cx } from "./cx";
import { FieldError } from "./Field";

export interface LogoUploadProps {
  /** Current logo: an existing URL or a data URL. */
  value: string | null;
  /** Downscaled `data:image/webp` (jpeg fallback) data URL, or null when removed. */
  onChange: (dataUrl: string | null, info?: { name: string; width: number; height: number; bytes: number }) => void;
  /** File name to show for an existing logo. */
  fileName?: string;
  maxBytes?: number;
  /** Longest side after downscaling. */
  maxSize?: number;
  changed?: boolean;
  className?: string;
}

const ACCEPT = ["image/png", "image/jpeg", "image/webp"];

function dataUrlBytes(url: string): number {
  const i = url.indexOf(",");
  const b64 = i >= 0 ? url.slice(i + 1) : url;
  return Math.round((b64.length * 3) / 4);
}

function fmtKB(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

async function downscale(file: File, max: number): Promise<{ url: string; width: number; height: number }> {
  const src = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("Couldn't read that image"));
      im.src = src;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't read that image");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    let url = canvas.toDataURL("image/webp", 0.86);
    if (!url.startsWith("data:image/webp")) {
      // No WebP encoder (older Safari): JPEG on white, since JPEG has no transparency.
      const c2 = document.createElement("canvas");
      c2.width = w;
      c2.height = h;
      const x2 = c2.getContext("2d");
      if (!x2) throw new Error("Couldn't read that image");
      x2.fillStyle = "#FFFFFF";
      x2.fillRect(0, 0, w, h);
      x2.drawImage(canvas, 0, 0);
      url = c2.toDataURL("image/jpeg", 0.88);
    }
    return { url, width: w, height: h };
  } finally {
    URL.revokeObjectURL(src);
  }
}

/**
 * Dashed drop zone ("Drop a logo here, or choose a file"), then a preview row
 * with Replace / Remove. Pictures are downscaled in the browser to 512 px.
 */
export function LogoUpload({ value, onChange, fileName, maxBytes = 2 * 1024 * 1024, maxSize = 512, changed, className }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ name: string; width: number; height: number; bytes: number } | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (!value) {
      setMeta(null);
      return;
    }
    // An existing logo may finish loading before hydration (onLoad missed).
    const im = imgRef.current;
    if (im && im.complete && im.naturalWidth && !meta) {
      setMeta({
        name: fileName ?? (value.startsWith("data:") ? "New logo" : "Current logo"),
        width: im.naturalWidth,
        height: im.naturalHeight,
        bytes: value.startsWith("data:") ? dataUrlBytes(value) : 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const take = async (file: File | undefined | null) => {
    if (!file) return;
    setError(null);
    if (!ACCEPT.includes(file.type)) {
      setError("Choose a PNG or JPG picture.");
      return;
    }
    if (file.size > maxBytes) {
      setError(`That file is ${fmtKB(file.size)}. Choose one up to ${fmtKB(maxBytes)}.`);
      return;
    }
    setBusy(true);
    try {
      const r = await downscale(file, maxSize);
      const info = { name: file.name, width: r.width, height: r.height, bytes: dataUrlBytes(r.url) };
      setMeta(info);
      onChange(r.url, info);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that image");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const picker = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT.join(",")}
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(e) => take(e.target.files?.[0])}
    />
  );

  if (value) {
    const name = meta?.name ?? fileName ?? (value.startsWith("data:") ? "New logo" : "Current logo");
    return (
      <div className={cx("flex flex-col gap-1.5", className)}>
        <div className={cx("flex flex-wrap items-center gap-3.5 rounded-control border p-3", changed ? "border-brand-200" : "border-line")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={value}
            alt="Logo preview"
            className="size-16 flex-none rounded-control border border-line bg-white object-cover"
            onLoad={(e) => {
              if (!meta) {
                const im = e.currentTarget;
                setMeta({ name, width: im.naturalWidth, height: im.naturalHeight, bytes: value.startsWith("data:") ? dataUrlBytes(value) : 0 });
              }
            }}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[15px]/[22px] font-semibold text-ink">{name}</span>
            {meta ? (
              <span className="num text-[13px]/[18px] font-medium text-muted">
                {meta.width} × {meta.height}
                {meta.bytes ? ` · ${fmtKB(meta.bytes)}` : ""}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1 max-lg:w-full">
            <Button variant="secondary" loading={busy} loadingText="Reading…" onClick={() => inputRef.current?.click()} className="max-lg:flex-1">
              Replace
            </Button>
            <button
              type="button"
              onClick={() => {
                setMeta(null);
                setError(null);
                onChange(null);
              }}
              className="inline-flex h-12 items-center px-2.5 text-[16px]/[24px] font-semibold text-bad-text hover:underline lg:h-10 lg:text-[15px]/[20px]"
            >
              Remove
            </button>
          </div>
          {picker}
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
      </div>
    );
  }

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Choose a logo"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files?.[0]);
        }}
        className={cx(
          "flex cursor-pointer items-center gap-3 rounded-control border-[1.5px] border-dashed p-3.5 outline-none transition-colors",
          "lg:flex-col lg:gap-1 lg:p-5 lg:text-center",
          over ? "border-brand-700 bg-brand-50" : "border-line-strong bg-white lg:bg-page hover:border-[#A8A29E]",
          error && "border-bad-solid",
        )}
      >
        <div className="grid size-11 flex-none place-items-center rounded-full bg-brand-50 text-brand-700 lg:mb-1.5">
          {busy ? <Spinner className="border-brand-200 border-t-brand-700" /> : <ImagePlus size={20} strokeWidth={1.75} aria-hidden="true" />}
        </div>
        <div className="flex min-w-0 flex-col lg:items-center">
          <span className="text-[16px]/[24px] font-semibold text-brand-700 lg:hidden">Choose a logo</span>
          <span className="hidden text-[15px]/[22px] font-medium text-ink lg:inline">
            Drop a logo here, or <span className="font-semibold text-brand-700 hover:underline">choose a file</span>
          </span>
          <span className="text-[13px]/[18px] font-medium text-muted">
            <span className="lg:hidden">PNG or JPG · up to 2 MB</span>
            <span className="hidden lg:inline">PNG or JPG · square works best · up to 2 MB</span>
          </span>
        </div>
        {picker}
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}
