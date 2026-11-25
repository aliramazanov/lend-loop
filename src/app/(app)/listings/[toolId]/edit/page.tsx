import { EditListing } from "@/components/listings/EditListing";
import type { Metadata } from "next";
import type { EditListingPageProps } from "@/types";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const { toolId } = await params;

  return <EditListing toolId={toolId} />;
}
