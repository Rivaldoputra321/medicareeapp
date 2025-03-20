// doctor.sidebar.component.tsx
'use client';

import { Layout, Menu } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  UserOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Sider } = Layout;

const DoctorSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: 'Appointments',
      onClick: () => router.push('/dashboard/doctor/')
    },

    {
      key: 'patients',
      icon: <CalendarOutlined />,
      label: 'Patients',
      onClick: () => router.push('/dashboard/doctor/medical_history/')
    },

    {
      key: 'transactions',
      icon: <CalendarOutlined />,
      label: 'Transactions',
      onClick: () => router.push('/dashboard/doctor/transaction/')
    },
  ];

  const getSelectedKey = () => {
    if (pathname?.includes('/dashboard/doctor/appointments')) return 'appointments';
    if (pathname?.includes('/dashboard/doctor/medical_history')) return 'patients';
    if (pathname?.includes('/dashboard/doctor/transaction')) return 'tansactions';
    return 'appointments';
  };

  return (
    <Sider width={220} className="bg-white fixed h-screen pt-16">
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        className="h-full border-r-0 pt-4"
        items={menuItems}
      />
    </Sider>
  );
};

export default DoctorSidebar;