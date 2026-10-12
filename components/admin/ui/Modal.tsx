"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { EyeOff, X } from "lucide-react";
import { Button, type ButtonVariant } from "./Button";
import { cx } from "./cx";
import { useBodyScrollLock, useEscape, useFocusTrap, useIsDesktop } from "./hooks";
import type { IconComponent } from "./icons";
import { Portal } from "./Portal";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional header row with a close button. */
  title?: React.ReactNode;
  /** Desktop width: sm 440 · md 480 · lg 560. */
  size?: "sm" | "md" | "lg";
  /** Esc and scrim close it (default true). */
  dismissible?: boolean;
  hideClose?: boolean;
  /** Element to focus first. */
  initialFocus?: React.RefObject<HTMLElement | null>;
  className?: string;
  "aria-label"?: string;
}

const WIDTH = { sm: "max-w-[440px]", md: "max-w-[480px]", lg: "max-w-[560px]" } as const;
const SCRIM = "fixed inset-0 z-[60] bg-[rgba(28,25,23,0.45)] animate-in fade-in-0 duration-150";

/**
 * Responsive dialog: a centred card (radius 20, dialog shadow) on desktop, a
 * bottom sheet (radius 24 on top, 40 × 4 grabber) on mobile. Esc and the
 * scrim close it; focus stays inside; page scroll is locked.
 */
export function Modal(props: ModalProps) {
  const isDesktop = useIsDesktop();
  if (!props.open) return null;
  return isDesktop ? <DialogPanel {...props} /> : <Sheet {...props} />;
}

function useOverlay(open: boolean, onClose: () => void, dismissible: boolean, panelRef: React.RefObject<HTMLDivElement>, initialFocus?: React.RefObject<HTMLElement | null>) {
  useBodyScrollLock(open);
  useEscape(open && dismissible, onClose);
  useFocusTrap(open, panelRef, initialFocus);
}

function DialogPanel({ open, onClose, children, title, size = "sm", dismissible = true, hideClose, initialFocus, className, ...rest }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  useOverlay(open, onClose, dismissible, panelRef, initialFocus);
  return (
    <Portal>
      <div
        className={cx(SCRIM, "flex items-center justify-center p-4")}
        onMouseDown={(e) => {
          if (dismissible && e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={rest["aria-label"]}
          tabIndex={-1}
          className={cx(
            "relative max-h-[calc(100vh-32px)] w-full animate-pop-in overflow-y-auto rounded-dialog bg-white p-6 shadow-dialog outline-none",
            WIDTH[size],
            className,
          )}
        >
          {title ? (
            <div className="mb-4 flex items-start gap-3">
              <h2 id={titleId} className="min-w-0 flex-1 text-dialog-title text-ink">
                {title}
              </h2>
              {!hideClose ? (
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="-mr-2 -mt-1.5 grid size-10 flex-none place-items-center rounded-control text-ink-2 hover:bg-fill"
                >
                  <X size={20} strokeWidth={1.75} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </Portal>
  );
}

/** Always a bottom sheet (used by Modal on mobile and by mobile-only pickers). */
export function Sheet({ open, onClose, children, title, dismissible = true, hideClose, initialFocus, className, ...rest }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  useOverlay(open, onClose, dismissible, panelRef, initialFocus);
  if (!open) return null;
  return (
    <Portal>
      <div
        className={cx(SCRIM, "flex flex-col justify-end")}
        onMouseDown={(e) => {
          if (dismissible && e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={rest["aria-label"]}
          tabIndex={-1}
          className={cx(
            "max-h-[92vh] w-full animate-sheet-up overflow-y-auto rounded-t-sheet bg-white px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_-12px_rgba(28,25,23,0.3)] outline-none",
            className,
          )}
        >
          <div aria-hidden="true" className={cx("mx-auto h-1 w-10 rounded-sm bg-line-strong", title ? "mb-1.5" : "mb-4")} />
          {title ? (
            <div className="flex h-12 items-center">
              <h2 id={titleId} className="min-w-0 flex-1 text-[17px]/[24px] font-bold text-ink">
                {title}
              </h2>
              {!hideClose ? (
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="-mr-2 grid size-11 flex-none place-items-center rounded-control text-ink-2 hover:bg-fill"
                >
                  <X size={20} strokeWidth={1.75} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </Portal>
  );
}

export type ConfirmTone = "danger" | "warning" | "info" | "success";

const TONE: Record<ConfirmTone, { circle: string; variant: ButtonVariant }> = {
  danger: { circle: "bg-bad-fill text-bad-text", variant: "destructive" },
  warning: { circle: "bg-wait-fill text-wait-text", variant: "primary" },
  info: { circle: "bg-brand-50 text-brand-700", variant: "primary" },
  success: { circle: "bg-good-fill text-good-text", variant: "success" },
};

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  body?: React.ReactNode;
  /** Extra content under the body (checkbox, reason select…). */
  children?: React.ReactNode;
  tone?: ConfirmTone;
  icon?: IconComponent;
  actionLabel: React.ReactNode;
  /** Defaults by tone: danger → destructive, success → success, else primary. */
  actionVariant?: ButtonVariant;
  /** Shown while onConfirm runs ("Hiding…"). */
  loadingLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /** May be async: the action shows a spinner and Cancel is disabled until it settles. */
  onConfirm: () => void | Promise<void>;
  /** Close after a successful confirm (default true). */
  closeOnConfirm?: boolean;
  /** Disable the action (e.g. a required reason is missing). */
  actionDisabled?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * 44 px round meaning icon · title 800 22/28 · body 15/24 ink-2 · Cancel +
 * action on the right. Mobile: bottom sheet, 48 px buttons stacked, action first.
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  body,
  children,
  tone = "danger",
  icon: Icon = EyeOff,
  actionLabel,
  actionVariant,
  loadingLabel,
  cancelLabel = "Cancel",
  onConfirm,
  closeOnConfirm = true,
  actionDisabled,
  size = "sm",
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const t = TONE[tone];
  const variant = actionVariant ?? t.variant;

  const run = async () => {
    try {
      const r = onConfirm();
      if (r && typeof (r as Promise<void>).then === "function") {
        setBusy(true);
        await r;
      }
      if (closeOnConfirm) onClose();
    } catch {
      // Keep the dialog open; the caller shows the error.
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      dismissible={!busy}
      size={size}
      initialFocus={tone === "danger" ? cancelRef : undefined}
      aria-label={typeof title === "string" ? title : undefined}
    >
      <span className={cx("grid size-11 place-items-center rounded-full", t.circle)}>
        <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="mt-3 text-dialog-title text-ink lg:mt-4">{title}</div>
      {body ? <div className="mt-1.5 text-body-m text-ink-2 [text-wrap:pretty] lg:mt-2 lg:text-body">{body}</div> : null}
      {children ? <div className="mt-4">{children}</div> : null}
      <div className="mt-5 flex flex-col gap-2 lg:mt-6 lg:flex-row-reverse lg:justify-start">
        <Button variant={variant} loading={busy} loadingText={loadingLabel} onClick={run} disabled={actionDisabled} fullWidth className="lg:w-auto">
          {actionLabel}
        </Button>
        <Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={busy} fullWidth className="lg:w-auto">
          {cancelLabel}
        </Button>
      </div>
    </Modal>
  );
}
