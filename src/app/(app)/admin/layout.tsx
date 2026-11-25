import { AdminNav } from "@/components/admin/AdminNav";
import { auth } from "@clerk/nextjs/server";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Admin" };

async function isAdmin(): Promise<boolean> {
  const { getToken } = await auth();
  const token = (await getToken({ template: "convex" })) ?? undefined;
  const user = await fetchQuery(api.users.getCurrentUser, {}, { token });

  return user?.role === "admin";
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await isAdmin())) notFound();

  return (
    <div className="space-y-5">
      <AdminNav />
      {children}
    </div>
  );
}
