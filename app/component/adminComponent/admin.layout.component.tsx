'use client';

import { Layout } from 'antd';
import Navbar from './navbar.component';
import Sidebar from './sidebar.component';


interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Layout>
        <Sidebar />
        <Layout className="bg-gray-50 ml-[220px] pt-16">
          {children}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;