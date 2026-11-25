import { EditListing } from "@/components/listings/EditListing";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit listing" };

interface EditListingPageProps {
  params: Promise<{ toolId: string }>;
}

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const { toolId } = await params;

  return <EditListing toolId={toolId} />;
}
