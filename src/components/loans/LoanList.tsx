import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoanCard } from "./LoanCard";
import type { LoanListProps } from "@/types";

export function LoanList({
  title,
  emptyText,
  perspective,
  loans,
}: LoanListProps) {
  return (
    <section>
      <PageHeader title={title} />

      {loans === undefined && <LoadingState label="Loading requests..." />}

      {loans?.length === 0 && <EmptyState>{emptyText}</EmptyState>}

      {loans && loans.length > 0 && (
        <ul className="space-y-3">
          {loans.map((loan) => (
            <li key={loan._id}>
              <LoanCard loan={loan} perspective={perspective} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
