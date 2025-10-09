import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CreateExamCourseForm from "../../components/forms/CreateExamCourseForm";

export default function CreateExamCourse() {
  return (
    <>
      <PageMeta
        title="Create Exam Course | Elearning - Admin Dashboard"
        description="Create new exam courses by combining exam sets"
      />
      <PageBreadcrumb pageTitle="Create Exam Course" />
      <div className="space-y-6">
        <ComponentCard title="">
          <CreateExamCourseForm />
        </ComponentCard>
      </div>
    </>
  );
}