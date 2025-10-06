import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { ReadingQuestionForm } from "../../components/forms";

export default function CreateReadingQuestion() {
  return (
    <>
      <PageMeta
        title="Create Reading Question | TailAdmin - Admin Dashboard"
        description="Create new reading comprehension questions for the E-learning system"
      />
      <PageBreadcrumb pageTitle="Create Reading Question" />
      <div className="space-y-6">
        <ComponentCard title="">
          <ReadingQuestionForm />
        </ComponentCard>
      </div>
    </>
  );
}