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
        title="Quản lý Người dùng | Elearning - Admin Dashboard"
        description="Trang quản lý tất cả người dùng trong hệ thống E-learning"
      />
      <PageBreadcrumb pageTitle="Quản lý Người dùng" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách Học viên">
          <StudentsTable />
        </ComponentCard>
        
        <ComponentCard title="Danh sách Mentor">
          <MentorsTable />
        </ComponentCard>
      </div>
    </>
  );
};

export default UserManagementPage;