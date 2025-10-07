import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { SpeakingQuestionForm } from "../../components/forms";

export default function CreateSpeakingQuestion() {
  return (
    <>
      <PageMeta
        title="Create Speaking Question | Elearning - Admin Dashboard"
        description="Create new speaking questions for the E-learning system"
      />
      <PageBreadcrumb pageTitle="Create Speaking Question" />
      <div className="space-y-6">
        <ComponentCard title="">
          <SpeakingQuestionForm />
        </ComponentCard>
      </div>
    </>
  );
}