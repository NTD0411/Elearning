import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import MentorsTable from "../../components/tables/BasicTables/MentorsTable";

export default function MentorsManagement() {
  return (
    <>
      <PageMeta
        title="Mentor Management | TailAdmin - Admin Dashboard"
        description="Mentor management page for E-learning system"
      />
      <PageBreadcrumb pageTitle="Mentor Management" />
      <div className="space-y-6">
        <ComponentCard title="Mentors List">
          <MentorsTable />
        </ComponentCard>
      </div>
    </>
  );
}