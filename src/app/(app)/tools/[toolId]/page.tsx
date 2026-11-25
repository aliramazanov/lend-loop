import { ToolDetails } from "@/components/tool-details/ToolDetails";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tool details" };

interface ToolPageProps {
  params: Promise<{ toolId: string }>;
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolId } = await params;

  return <ToolDetails toolId={toolId} />;
}
