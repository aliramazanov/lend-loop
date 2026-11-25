import { ToolBrowser } from "@/components/tools/ToolBrowser";
import { categoryFromSlug } from "@/lib/categories";
import type { Metadata } from "next";
import type { BrowsePageProps } from "@/types";

export const metadata: Metadata = { title: "Browse tools" };

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { category } = await searchParams;

  return <ToolBrowser category={categoryFromSlug(category)} />;
}
