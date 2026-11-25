import { categoryToSlug } from "./categories";
import type { Category } from "@convex/types";

export const ROUTES = {
  home: "/",
  browse: "/browse",
  listings: "/listings",
  newListing: "/listings/new",
  requests: "/requests",
  incoming: "/incoming",
  admin: "/admin",
  adminNeighbors: "/admin/neighbors",
  adminLoans: "/admin/loans",
  adminRemoved: "/admin/removed",
  adminAudit: "/admin/audit",
  adminAutomation: "/admin/automation",
} as const;

export function toolRoute(toolId: string): string {
  return `/tools/${toolId}`;
}

export function editListingRoute(toolId: string): string {
  return `/listings/${toolId}/edit`;
}

export function browseRoute(category?: Category): string {
  if (!category) return ROUTES.browse;

  const params = new URLSearchParams({ category: categoryToSlug(category) });

  return `${ROUTES.browse}?${params.toString()}`;
}
