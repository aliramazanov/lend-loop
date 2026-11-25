import { MyListings } from "@/components/listings/MyListings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My listings" };

export default function ListingsPage() {
  return <MyListings />;
}
