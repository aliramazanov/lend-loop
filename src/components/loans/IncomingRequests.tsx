"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { LoanList } from "./LoanList";

export function IncomingRequests() {
  const loans = useQuery(api.loans.listIncomingRequests);

  return (
    <LoanList
      title="Incoming Requests on My Tools"
      emptyText="No borrow requests on your tools yet."
      perspective="lender"
      loans={loans}
    />
  );
}
