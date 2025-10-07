import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { ListeningQuestionForm } from "../../components/forms";

export default function CreateListeningQuestion() {
  return (
    <>
      <PageMeta
        title="Create Listening Question | Elearning - Admin Dashboard"
        description="Create new listening comprehension questions for the E-learning system"
      />
      <PageBreadcrumb pageTitle="Create Listening Question" />
      <div className="space-y-6">
        <ComponentCard title="">
          <ListeningQuestionForm />
        </ComponentCard>
      </div>
    </>
  );
}