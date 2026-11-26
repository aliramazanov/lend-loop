/*
 * The admin area. The server checks the role first, and anyone who is not an admin gets
 * a not-found page before any admin data loads.
 */

import { AdminNav } from "@/components/admin/AdminNav";
import { auth } from "@clerk/nextjs/server";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AdminLayoutProps } from "@/types";

export const metadata: Metadata = { title: "Admin" };

async function isAdmin(): Promise<boolean> {
  const { getToken } = await auth();
  const token = (await getToken({ template: "convex" })) ?? undefined;
  const user = await fetchQuery(api.users.getCurrentUser, {}, { token });

  return user?.role === "admin";
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  if (!(await isAdmin())) notFound();

  return (
    <div className="space-y-5">
      <AdminNav />
      {children}
    </div>
  );
}
