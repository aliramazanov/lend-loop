import { IncomingRequests } from "@/components/loans/IncomingRequests";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Incoming requests" };

export default function IncomingPage() {
  return <IncomingRequests />;
}
