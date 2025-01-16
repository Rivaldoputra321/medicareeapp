// doctor.layout.component.tsx
'use client';

import { Layout } from 'antd';
import DoctorSidebar from './sidebar.doctor.component';
import DoctorNavbar from './navbar.doctor.compontent';
interface DoctorLayoutProps {
  children: React.ReactNode;
}

const DoctorLayout = ({ children }: DoctorLayoutProps) => {
  return (
    <Layout className="min-h-screen">
      <DoctorNavbar />
      <Layout>
        <DoctorSidebar />
        <Layout className="bg-gray-50 ml-[220px] pt-16">
          {children}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DoctorLayout;

