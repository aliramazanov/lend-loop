import { CATEGORIES, type Category } from "@convex/shared/catalog";

export function categoryToSlug(category: Category): string {
  return category.replaceAll(" ", "-");
}

export function categoryFromSlug(slug?: string | null): Category | undefined {
  return CATEGORIES.find((category) => categoryToSlug(category) === slug);
}

export function categoryLabel(category: Category): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
