"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Spinner } from "@/components/admin/ui/Button";
import { cx } from "@/components/admin/ui/cx";
import { FieldError } from "@/components/admin/ui/Field";

/**
 * Public logo picker (Page 12 / 13): a dashed drop zone on #FAFAF9 —
 * "Drop your logo here, or choose a file" · "PNG or JPG · up to 2 MB" — then a
 * preview row with Replace / Remove. Pictures are downscaled in the browser
 * (512 px, WebP or JPEG) and handed back as a data URL.
 */

export interface LogoFieldProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  /** Error from the server (e.g. "That picture is too big"). */
  error?: string | null;
  changed?: boolean;
  id?: string;
  maxBytes?: number;
  maxSize?: number;
  className?: string;
}

const ACCEPT = ["image/png", "image/jpeg", "image/webp"];

function dataUrlBytes(url: string): number {
  const i = url.indexOf(",");
  return Math.round(((i >= 0 ? url.length - i - 1 : url.length) * 3) / 4);
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
      im.onerror = () => reject(new Error("Couldn't read that picture."));
      im.src = src;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't read that picture.");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    let url = canvas.toDataURL("image/webp", 0.86);
    if (!url.startsWith("data:image/webp")) {
      // No WebP encoder (older Safari): JPEG on white.
      const c2 = document.createElement("canvas");
      c2.width = w;
      c2.height = h;
      const x2 = c2.getContext("2d");
      if (!x2) throw new Error("Couldn't read that picture.");
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

export function LogoField({ value, onChange, error, changed, id, maxBytes = 2 * 1024 * 1024, maxSize = 512, className }: LogoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ name: string; width: number; height: number; bytes: number } | null>(null);

  useEffect(() => {
    if (!value) setMeta(null);
  }, [value]);

  const take = async (file: File | undefined | null) => {
    if (!file) return;
    setLocalError(null);
    if (!ACCEPT.includes(file.type)) {
      setLocalError("Choose a PNG or JPG picture.");
      return;
    }
    if (file.size > maxBytes) {
      setLocalError(`That file is ${fmtKB(file.size)}. Choose one up to ${fmtKB(maxBytes)}.`);
      return;
    }
    setBusy(true);
    try {
      const r = await downscale(file, maxSize);
      setMeta({ name: file.name, width: r.width, height: r.height, bytes: dataUrlBytes(r.url) });
      onChange(r.url);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Couldn't read that picture.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const shownError = localError ?? error ?? null;
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
    const name = meta?.name ?? (value.startsWith("data:") ? "New logo" : "Current logo");
    return (
      <div className={cx("flex flex-col gap-1.5", className)}>
        <div
          className={cx(
            "flex flex-wrap items-center gap-3.5 rounded-control border p-3",
            changed ? "border-[1.5px] border-brand-200" : "border-line",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Logo preview"
            className="size-16 flex-none rounded-control border border-line bg-white object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[15px]/[22px] font-semibold text-ink">{name}</span>
            {meta ? (
              <span className="num text-[13px]/[18px] font-medium text-muted">
                {meta.width} × {meta.height} · {fmtKB(meta.bytes)}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1 max-sm:w-full">
            <button
              id={id}
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-line bg-white px-4 text-[16px]/[24px] font-semibold text-ink hover:bg-fill max-sm:flex-1 lg:h-10 lg:text-[15px]/[20px]"
            >
              {busy ? <Spinner /> : null}
              {busy ? "Reading…" : "Replace"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMeta(null);
                setLocalError(null);
                onChange(null);
              }}
              className="inline-flex h-12 items-center px-2.5 text-[16px]/[24px] font-semibold text-bad-text hover:underline lg:h-10 lg:text-[15px]/[20px]"
            >
              Remove
            </button>
          </div>
          {picker}
        </div>
        {shownError ? <FieldError>{shownError}</FieldError> : null}
      </div>
    );
  }

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <div
        id={id}
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
          "flex cursor-pointer items-center gap-3.5 rounded-control border-[1.5px] border-dashed p-4 outline-none transition-colors",
          over ? "border-brand-700 bg-brand-50" : "border-line-strong bg-page hover:border-[#A8A29E]",
          shownError && "border-bad-solid",
        )}
      >
        <span className="grid size-11 flex-none place-items-center rounded-full bg-brand-50 text-brand-700">
          {busy ? <Spinner className="border-brand-200 border-t-brand-700" /> : <ImagePlus size={20} strokeWidth={1.75} aria-hidden="true" />}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[15px]/[22px] font-medium text-ink">
            Drop your logo here, or <span className="font-semibold text-brand-700 hover:underline">choose a file</span>
          </span>
          <span className="text-[13px]/[18px] font-medium text-muted">PNG or JPG · up to 2 MB</span>
        </span>
        {picker}
      </div>
      {shownError ? <FieldError>{shownError}</FieldError> : null}
    </div>
  );
}
