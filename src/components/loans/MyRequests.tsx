"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { LoanList } from "./LoanList";

export function MyRequests() {
  const loans = useQuery(api.loans.listMyRequests);

  return (
    <LoanList
      title="My Borrow Requests"
      emptyText="You haven't requested any tools yet. Browse the board to find one."
      perspective="borrower"
      loans={loans}
    />
  );
}
