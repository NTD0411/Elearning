import React from 'react';
import StudentsTable from '../components/tables/BasicTables/StudentsTable';
import MentorsTable from '../components/tables/BasicTables/MentorsTable';
import ComponentCard from '../components/common/ComponentCard';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import PageMeta from '../components/common/PageMeta';

const UserManagementPage: React.FC = () => {
  return (
  <>
    <PageMeta
      title="User Management | Elearning - Admin Dashboard"
      description="Page for managing all users in the E-learning system"
    />
    <PageBreadcrumb pageTitle="User Management" />
    <div className="space-y-6">
      <ComponentCard title="Student List">
        <StudentsTable />
      </ComponentCard>
      
      <ComponentCard title="Mentor List">
        <MentorsTable />
      </ComponentCard>
    </div>
  </>
);

};

export default UserManagementPage;