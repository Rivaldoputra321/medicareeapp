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
      onClick: () => router.push('/dashboard/doctor/appointments')
    },
    {
      key: 'schedule',
      icon: <ClockCircleOutlined />,
      label: 'My Schedule',
      onClick: () => router.push('/dashboard/doctor/schedule')
    },
    {
      key: 'patients',
      icon: <UserOutlined />,
      label: 'My Patients',
      onClick: () => router.push('/dashboard/doctor/patients')
    },
    {
      key: 'consultations',
      icon: <CheckCircleOutlined />,
      label: 'Consultations',
      onClick: () => router.push('/dashboard/doctor/consultations')
    },
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Profile Settings',
      onClick: () => router.push('/dashboard/doctor/profile')
    }
  ];

  const getSelectedKey = () => {
    if (pathname?.includes('/dashboard/doctor/appointments')) return 'appointments';
    if (pathname?.includes('/dashboard/doctor/schedule')) return 'schedule';
    if (pathname?.includes('/dashboard/doctor/patients')) return 'patients';
    if (pathname?.includes('/dashboard/doctor/consultations')) return 'consultations';
    if (pathname?.includes('/dashboard/doctor/profile')) return 'profile';
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