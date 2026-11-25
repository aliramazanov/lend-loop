import { ToolDetails } from "@/components/tool-details/ToolDetails";
import type { Metadata } from "next";
import type { ToolPageProps } from "@/types";

export const metadata: Metadata = { title: "Tool details" };

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolId } = await params;

  return <ToolDetails toolId={toolId} />;
}
