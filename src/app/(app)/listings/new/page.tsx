import { ToolForm } from "@/components/listings/ToolForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "List a tool" };

export default function NewListingPage() {
  return <ToolForm />;
}
