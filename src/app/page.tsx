import { PublicBoard } from "@/components/public/PublicBoard";
import { ROUTES } from "@/lib/routes";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) redirect(ROUTES.browse);

  return <PublicBoard />;
}
