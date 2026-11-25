import type { Button } from "@/components/ui/Button";
import type { api } from "@convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import type { ComponentProps, ReactNode } from "react";

export interface AdminLayoutProps {
  children: ReactNode;
}

export interface BrowsePageProps {
  searchParams: Promise<{ category?: string }>;
}

export interface SignedInLayoutProps {
  children: ReactNode;
}

export interface EditListingPageProps {
  params: Promise<{ toolId: string }>;
}

export interface PageTransitionProps {
  children: ReactNode;
}

export interface ToolPageProps {
  params: Promise<{ toolId: string }>;
}

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface RootLayoutProps {
  children: ReactNode;
}

export interface AccountGateProps {
  children: ReactNode;
}

export interface ConvexClientProviderProps {
  children: ReactNode;
}

export interface LogoMarkProps {
  className?: string;
}

export interface NavLinkProps {
  href: string;
  exact?: boolean;
  children: ReactNode;
}

export interface SiteHeaderProps {
  children?: ReactNode;
  navigation?: ReactNode;
}

export type PublicTools = FunctionReturnType<typeof api.tools.listPublicBoard>;

export interface PublicToolListProps {
  tools: PublicTools;
}

export type ButtonVariant = ComponentProps<typeof Button>["variant"];

export interface SignInCtaProps {
  variant?: ButtonVariant;
}
