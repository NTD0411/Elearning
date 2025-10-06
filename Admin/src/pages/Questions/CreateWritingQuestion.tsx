import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { WritingQuestionForm } from "../../components/forms";

export default function CreateWritingQuestion() {
  return (
    <>
      <PageMeta
        title="Create Writing Question | TailAdmin - Admin Dashboard"
        description="Create new writing questions for the E-learning system"
      />
      <PageBreadcrumb pageTitle="Create Writing Question" />
      <div className="space-y-6">
        <ComponentCard title="">
          <WritingQuestionForm />
        </ComponentCard>
      </div>
    </>
  );
}