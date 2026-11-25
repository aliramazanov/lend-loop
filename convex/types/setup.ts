import type { Category, Condition } from "./catalog";

export interface SeedTool {
  name: string;
  category: Category;
  condition: Condition;
  shortDescription: string;
}

export interface SeedNeighbor {
  clerkId: string;
  name: string;
  trustedLender: boolean;
  tools: SeedTool[];
}
