import { ROUTES } from "@/lib/routes";
import { SITE_NAME } from "@/lib/site";
import Link from "next/link";
import { LogoMark } from "./LogoMark";

export function Brand() {
  return (
    <Link href={ROUTES.home} className="flex items-center gap-3 rounded-lg">
      <LogoMark className="size-9 shrink-0" />

      <span className="text-lg font-semibold tracking-tight">{SITE_NAME}</span>
    </Link>
  );
}
