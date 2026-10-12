import type { InboxView } from "@/components/admin/shell";
import type { Claim, ClaimStatus, ClaimRole } from "@/lib/admin/types";
import type { ClaimRow } from "./rows";

/** Shapes the claims page passes from the server to its parts. */

export interface ClaimListItem {
  id: number;
  listingName: string;
  claimantName: string;
  role: ClaimRole;
  status: ClaimStatus;
  /** Rejected after the owner said NO. */
  flagged: boolean;
  /** An earlier claim from this number was flagged. */
  flaggedBefore: boolean;
  changes: number;
  createdAt: string;
  decidedAt: string | null;
}

export interface ClaimListingInfo {
  id: number;
  slug: string;
  name: string;
  logoUrl: string | null;
}

export interface ClaimDetailData {
  claim: Claim;
  /** null when the listing no longer exists. */
  listing: ClaimListingInfo | null;
  /** The listing's current WhatsApp (or phone): the number to verify on. */
  listingNumber: string;
  /** Change rows in display order (for an applied claim: as they were before applying). */
  rows: ClaimRow[];
  /** Updated claims: the rows that were applied. */
  appliedRows: ClaimRow[];
  unchanged: string[];
  unchangedRows: Array<{ key: string; field: string; value: string }>;
  flaggedBefore: boolean;
  /** "WhatsApp reply" · "phone call" · "other proof" (verified claims). */
  verifiedBy: string;
  /** "new phone number, Civic price, adds Fortuner". */
  summary: string;
  view: InboxView;
}
