import { MyRequests } from "@/components/loans/MyRequests";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My requests" };

export default function RequestsPage() {
  return <MyRequests />;
}
