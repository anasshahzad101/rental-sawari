"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, CircleX, MapPin, RotateCcw, Shuffle } from "lucide-react";
import { isSiteCity } from "@/lib/admin/constants";
import { fmtPhone, waLink } from "@/lib/admin/format";
import type { ListingRequestPayload, RequestStatus } from "@/lib/admin/types";
import {
  approveRequestAction,
  convertRequestAction,
  fixRequestAction,
  rejectRequestAction,
  reopenRequestAction,
} from "@/app/(admin)/admin/_actions/inbox";
import { Banner } from "@/components/admin/ui/Banner";
import { Button, LockedReason } from "@/components/admin/ui/Button";
import { CityPicker } from "@/components/admin/ui/CityPicker";
import { cx } from "@/components/admin/ui/cx";
import type { IconComponent } from "@/components/admin/ui/icons";
import { StatusPill } from "@/components/admin/ui/StatusPill";
import { CopyButton } from "@/components/admin/ui/WhatsAppPreview";
import { InboxDetailFooter, InboxDetailFrame, MobileActionBar } from "../../_shared/layout";
import { inboxHref } from "../../_shared/params";
import { useInboxAction } from "../../_shared/useInboxAction";
import { ApplicantWhatsApp } from "./ApplicantWhatsApp";
import { RejectDialog } from "./RejectDialog";
import { AlsoSentLine, RequestPreview } from "./RequestPreview";
import { applicantTemplates, firstName, liveMessage } from "./text";

export interface RequestDetailProps {
  id: number;
  status: RequestStatus;
  payload: ListingRequestPayload;
  /** fmtWhen(createdAt) */
  sentText: string;
  /** fmtWhen(decidedAt) */
  decidedText: string | null;
  rejectReason: string | null;
  note: string | null;
  duplicate: { id: number; name: string; city: string; area: string } | null;
  /** The listing an approved request created. */
  created: { id: number; slug: string; status: "live" | "hidden" } | null;
  claimId: number | null;
  /** Slug the listing would get (for the "live" template before approval). */
  slugGuess: string;
  areasByCity: Record<string, string[]>;
}

/** The right-hand detail of a listing request (full screen on mobile). */
export function RequestDetail(props: RequestDetailProps) {
  const { id, status, payload: p, sentText, decidedText, rejectReason, note, duplicate, created, claimId, slugGuess, areasByCity } = props;
  const router = useRouter();
  const { run, pending, busy } = useInboxAction();
  const [rejectOpen, setRejectOpen] = useState(false);

  const isNew = status === "new";
  const noCity = isNew && !isSiteCity(p.city);
  const name = p.name || "this request";
  const slug = created?.slug ?? slugGuess;
  const templates = applicantTemplates({ owner: p.ownerName, name: p.name, slug, rejectReason });
  const defaultTemplate = status === "approved" ? "live" : status === "rejected" ? "rejected" : "received";
  const cityShown = p.city || p.cityOther;

  // ── Actions ────────────────────────────────────────────────────────────
  const onFix = (partial: Partial<ListingRequestPayload>) =>
    run("fix", () => fixRequestAction(id, partial), { toast: () => "Fix saved. It goes live when you approve.", quietError: true });

  const pickCity = (city: string) =>
    run("city", () => fixRequestAction(id, { city }), { toast: () => `City set to ${city}` });

  const approve = () =>
    run("approve", () => approveRequestAction(id), {
      toast: () => `${name} is live on the site`,
      go: () => inboxHref("requests", { view: "done", id }),
    });

  const reject = async (reason: string, text: string) => {
    const r = await run("reject", () => rejectRequestAction(id, reason, text), {
      toast: () => ({
        message: `${name} rejected`,
        undo: async () => {
          const u = await reopenRequestAction(id);
          if (u.ok) {
            router.replace(inboxHref("requests", { id }), { scroll: false });
            router.refresh();
          }
        },
      }),
      go: () => inboxHref("requests", { view: "rejected", id }),
    });
    return !!r?.ok;
  };

  const reopen = () =>
    run("reopen", () => reopenRequestAction(id), { toast: () => "Request reopened", go: () => inboxHref("requests", { id }) });

  const convert = () =>
    run("convert", () => convertRequestAction(id), {
      toast: () => `Moved to Claims. Verify ownership before changing ${duplicate?.name ?? "the listing"}.`,
      go: (r) => `/admin/inbox/claims?id=${r.claimId}`,
    });

  // ── Header ─────────────────────────────────────────────────────────────
  const pill =
    status === "new" ? (
      <StatusPill kind="new" size="sm" className="max-lg:hidden" />
    ) : status === "approved" ? (
      <StatusPill kind="approved" size="sm" />
    ) : status === "rejected" ? (
      <StatusPill kind="rejected" size="sm" />
    ) : (
      <StatusPill kind="dismissed" size="sm" icon={null} label="Moved to Claims" />
    );

  const wa = (variant: "desktop" | "mobile") =>
    p.whatsapp ? (
      <ApplicantWhatsApp variant={variant} toName={p.ownerName} toNumber={p.whatsapp} templates={templates} defaultKey={defaultTemplate} />
    ) : null;

  return (
    <InboxDetailFrame aria-label={`Listing request: ${p.name}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4 lg:border-b lg:border-fill lg:px-6 lg:pb-5 lg:pt-6">
        <div className="flex min-w-0 flex-1 flex-col lg:gap-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h2 className="min-w-0 text-page-title-m text-ink [overflow-wrap:anywhere] lg:text-dialog-title">{p.name}</h2>
            {pill}
          </div>
          <span className="num hidden text-[13px]/[18px] font-medium text-muted lg:block">
            New listing request · sent {sentText}
            {p.ownerName ? ` by ${p.ownerName}` : ""}
            {p.whatsapp ? ` · ${fmtPhone(p.whatsapp)}` : ""}
            {!isSiteCity(p.city) && p.cityOther ? ` · City typed: "${p.cityOther}"` : ""}
          </span>
          <span className="num text-[13px]/[18px] font-medium text-muted lg:hidden">
            Sent {sentText}
            {p.ownerName ? ` · ${p.ownerName}` : ""}
          </span>
        </div>
        <div className="hidden flex-none lg:block">{wa("desktop")}</div>
        <div className="lg:hidden">{wa("mobile")}</div>
      </div>

      <div className="flex flex-col gap-3 lg:px-6 lg:pb-6 lg:pt-5">
        {/* ── New: warnings ── */}
        {isNew && duplicate ? (
          <Banner
            tone="warning"
            actions={
              <>
                <Button variant="secondary" href={`/admin/listings/${duplicate.id}`} target="_blank" iconRight={ArrowUpRight} className="lg:px-3.5">
                  Open that listing
                </Button>
                <Button variant="soft-teal" onClick={convert} loading={pending === "convert"} loadingText="Moving…" disabled={busy && pending !== "convert"} className="lg:px-3.5">
                  Treat as a claim instead
                </Button>
              </>
            }
          >
            This WhatsApp number is already on <b className="font-bold">{duplicate.name}</b> (
            {[duplicate.city, duplicate.area].filter(Boolean).join(" · ")}).
            <span className="mt-3 block text-[13px]/[18px] font-medium text-ink-2">
              If it&apos;s the same business, treat it as a claim: their details become requested changes to the existing listing, and ownership gets verified first.
            </span>
          </Banner>
        ) : null}

        {noCity ? (
          <Banner
            tone="warning"
            icon={MapPin}
            actions={
              <>
                <div className="min-w-0 flex-1 lg:min-w-[220px]">
                  <CityPicker value={null} onChange={pickCity} placeholder="Choose another city" disabled={busy} aria-label="Choose a city" />
                </div>
                <Button variant="soft-red" onClick={() => setRejectOpen(true)} disabled={busy} className="flex-none lg:px-3.5">
                  Reject
                </Button>
              </>
            }
          >
            <b className="font-bold">{cityShown ? `${cityShown} isn't a city on the site yet.` : "No city was picked."}</b> Pick one of the 21 cities to
            publish, or reject the request.
          </Banner>
        ) : null}

        {/* ── Done / Rejected: final state ── */}
        {status === "approved" ? (
          <>
            {created?.status === "hidden" ? (
              <Banner tone="neutral" layout="inline" actions={<OpenListing id={created.id} />}>
                Approved {decidedText}. The listing is hidden now.
              </Banner>
            ) : (
              <Banner tone="success" title="Live on the site." layout="inline" actions={created ? <OpenListing id={created.id} /> : null}>
                Approved {decidedText}.
              </Banner>
            )}
            {p.whatsapp ? (
              <div className="rounded-[14px] border border-line bg-white p-4">
                <div className="text-[15px]/[22px] font-bold text-ink">Tell {firstName(p.ownerName) || "them"} it&apos;s live</div>
                <div className="mt-2.5 rounded-[14px_14px_4px_14px] border border-good-border bg-good-fill px-3.5 py-3 text-[16px]/[24px] text-ink [overflow-wrap:anywhere] [text-wrap:pretty] lg:text-[15px]/[24px]">
                  {liveMessage(p.name, slug)}
                </div>
                <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:flex-wrap">
                  <Button variant="whatsapp" href={waLink(p.whatsapp, liveMessage(p.name, slug))} target="_blank" fullWidth className="lg:w-auto lg:px-4">
                    Send &quot;Your listing is live&quot; on WhatsApp
                  </Button>
                  <CopyButton text={liveMessage(p.name, slug)} fullWidth className="lg:w-auto" />
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {status === "rejected" ? (
          <StateBox tone="red" icon={CircleX}>
            <span>
              <b className="font-bold text-bad-text">Rejected</b> {decidedText}
              {rejectReason ? ` · ${rejectReason}` : ""}.
            </span>
            {note ? <span className="block text-[13px]/[18px] text-ink-2">Your note: &ldquo;{note}&rdquo;</span> : null}
            <span className="flex">
              <Button variant="ghost" icon={RotateCcw} onClick={reopen} loading={pending === "reopen"} loadingText="Reopening…" className="-ml-3 text-brand-700 hover:text-brand-800">
                Reopen
              </Button>
            </span>
          </StateBox>
        ) : null}

        {status === "converted" ? (
          <StateBox tone="grey" icon={Shuffle}>
            <span>
              <b className="font-bold">Moved to Claims</b> {decidedText}. Their details became requested changes on{" "}
              <b className="font-bold">{duplicate?.name ?? "the existing listing"}</b>, applied only after ownership is verified.
            </span>
            {claimId ? (
              <Link href={`/admin/inbox/claims?id=${claimId}`} className="inline-flex items-center gap-1 text-[14px]/[20px] font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                Open the claim
                <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
              </Link>
            ) : null}
          </StateBox>
        ) : null}

        {/* ── Preview ── */}
        <div className={cx("items-center justify-between gap-3", isNew ? "hidden lg:flex" : "flex pt-1")}>
          <span className="text-overline uppercase text-muted">{isNew ? "How it will look" : "What they sent"}</span>
          {isNew ? <span className="text-[13px]/[18px] font-medium text-muted">Approved listings start on Free</span> : null}
        </div>
        <RequestPreview payload={p} editable={isNew} areasByCity={areasByCity} onFix={onFix} />
        <AlsoSentLine payload={p} />
      </div>

      {/* ── Actions (New only) ── */}
      {isNew ? (
        <>
          {noCity ? (
            <InboxDetailFooter className="flex-col items-end gap-2">
              <Button variant="success" locked>
                Approve &amp; publish
              </Button>
              <LockedReason>Choose a city first</LockedReason>
            </InboxDetailFooter>
          ) : (
            <InboxDetailFooter>
              <span className="text-[13px]/[18px] font-medium text-muted">Live on the site within a minute of approving.</span>
              <Button variant="secondary" className="ml-auto" onClick={() => setRejectOpen(true)} disabled={busy}>
                Reject
              </Button>
              <Button variant="success" icon={Check} onClick={approve} loading={pending === "approve"} loadingText="Publishing…" disabled={busy && pending !== "approve"} className="px-[18px]">
                Approve &amp; publish
              </Button>
            </InboxDetailFooter>
          )}
          <MobileActionBar>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setRejectOpen(true)} disabled={busy} className="px-[18px]">
                Reject
              </Button>
              {noCity ? (
                <Button variant="success" locked className="flex-1">
                  Approve &amp; publish
                </Button>
              ) : (
                <Button variant="success" icon={Check} onClick={approve} loading={pending === "approve"} loadingText="Publishing…" disabled={busy && pending !== "approve"} className="flex-1">
                  Approve &amp; publish
                </Button>
              )}
            </div>
            {noCity ? <LockedReason className="justify-end">Choose a city first</LockedReason> : null}
          </MobileActionBar>
          <RejectDialog
            open={rejectOpen}
            onClose={() => setRejectOpen(false)}
            name={p.name}
            defaultReason={duplicate ? "Duplicate" : null}
            onReject={reject}
          />
        </>
      ) : null}
    </InboxDetailFrame>
  );
}

function OpenListing({ id }: { id: number }) {
  return (
    <Link
      href={`/admin/listings/${id}`}
      className="inline-flex h-10 items-center gap-1 whitespace-nowrap px-1.5 text-[14px]/[20px] font-semibold text-brand-700 hover:text-brand-800 hover:underline"
    >
      Open the new listing
      <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
    </Link>
  );
}

function StateBox({ tone, icon: Icon, children }: { tone: "red" | "grey"; icon: IconComponent; children: React.ReactNode }) {
  return (
    <div
      className={cx(
        "flex gap-2.5 rounded-control border px-4 py-3 text-[16px]/[24px] font-medium text-ink-2 lg:text-[15px]/[22px]",
        tone === "red" ? "border-bad-border bg-bad-fill" : "border-line bg-fill",
      )}
    >
      <Icon size={20} strokeWidth={1.75} aria-hidden="true" className={cx("mt-0.5 flex-none lg:mt-px", tone === "red" ? "text-bad-text" : "text-quiet-text")} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">{children}</div>
    </div>
  );
}
