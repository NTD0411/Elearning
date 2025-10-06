import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CreateExamSetForm from "../../components/forms/CreateExamSetForm";

export default function CreateExamSet() {
  return (
    <>
      <PageMeta
        title="Create Exam Set | TailAdmin - Admin Dashboard"
        description="Create new exam sets for organizing questions"
      />
      <PageBreadcrumb pageTitle="Create Exam Set" />
      <div className="space-y-6">
        <ComponentCard title="">
          <CreateExamSetForm />
        </ComponentCard>
      </div>
    </>
  );
}