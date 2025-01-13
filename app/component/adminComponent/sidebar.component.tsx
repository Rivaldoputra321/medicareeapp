'use client';

import { Layout, Menu } from 'antd';
import { UserAddOutlined, AppstoreAddOutlined, TeamOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Sider } = Layout;

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: 'doctors',
      icon: <UserAddOutlined />,
      label: 'Manage Doctors',
      onClick: () => router.push('/dashboard/admin/manage-doctors')
    },
    {
      key: 'patients',
      icon: <TeamOutlined />,
      label: 'Manage Patients',
      onClick: () => router.push('/dashboard/admin/manage-patients')
    },
    {
      key: 'specialists',
      icon: <AppstoreAddOutlined />,
      label: 'Manage Specialists',
      onClick: () => router.push('/dashboard/admin/manage-spesialists') // Fixed typo here
    }
  ];

  const getSelectedKey = () => {
    if (pathname?.includes('/dashboard/admin/manage-doctors')) return 'doctors';
    if (pathname?.includes('/dashboard/admin/manage-patients')) return 'patients';
    if (pathname?.includes('/dashboard/admin/manage-spesialists')) return 'specialists';
    return 'doctors'; // Default to 'doctors' if none match
  };

  return (
    <Sider width={220} className="bg-white fixed h-screen pt-16">
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]} // Ensure selectedKeys is passed as an array
        className="h-full border-r-0 pt-4"
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;
