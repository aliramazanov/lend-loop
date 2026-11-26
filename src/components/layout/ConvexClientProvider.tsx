"use client";

/*
 * ConvexClientProvider: connects Convex to Clerk, so every query and mutation runs as the
 * signed-in neighbor.
 */

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ConvexClientProviderProps } from "@/types";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
