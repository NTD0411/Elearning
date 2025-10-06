import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import StudentsTable from "../../components/tables/BasicTables/StudentsTable";

export default function StudentsManagement() {
  return (
    <>
      <PageMeta
        title="Student Management | TailAdmin - Admin Dashboard"
        description="Student management page for E-learning system"
      />
      <PageBreadcrumb pageTitle="Student Management" />
      <div className="space-y-6">
        <ComponentCard title="Students List">
          <StudentsTable />
        </ComponentCard>
      </div>
    </>
  );
}