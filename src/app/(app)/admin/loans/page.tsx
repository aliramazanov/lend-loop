import { LoansTable } from "@/components/admin/LoansTable";

export default function AdminLoansPage() {
  return (
    <>
      <h1 className="sr-only">All loans</h1>
      <LoansTable />
    </>
  );
}
