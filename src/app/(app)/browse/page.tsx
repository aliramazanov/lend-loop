import { ToolBrowser } from "@/components/tools/ToolBrowser";
import { categoryFromSlug } from "@/lib/categories";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Browse tools" };

interface BrowsePageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { category } = await searchParams;

  return <ToolBrowser category={categoryFromSlug(category)} />;
}
