import { AuditLogTable } from "@/components/admin/AuditLogTable";

export default function AdminAuditPage() {
  return (
    <>
      <h1 className="sr-only">Audit log</h1>
      <AuditLogTable />
    </>
  );
}
