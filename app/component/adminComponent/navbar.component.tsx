'use client';

import { Row, Col, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { User, getCurrentUser, logout } from '@/utils/auth';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import defaultProfilePic from '@/public/default-profile.png';

const { Title } = Typography;


const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser?.user_type === 'admin') {
      setUser(savedUser);
    } else {
      router.push('/unauthorized');
    }
  }, [router]);
  const handleLogout = () => {
    logout();
    router.push('/signin');
  };

  return (
    <header className="bg-white px-6 shadow-md h-16 fixed w-full z-50">
      <Row justify="space-between" align="middle" className="h-full">
        <Col>
          <Title level={3} className="m-0 text-emerald-600">
            MediCare Admin Panel
          </Title>
        </Col>
        <Col>
          <div className="group relative">
            <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={ defaultProfilePic}
                  alt="Admin Profile"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700">{user?.name || 'Admin'}</span>
                <span className="text-xs text-gray-500 capitalize">{user?.user_type || 'administrator'}</span>
              </div>
            </div>
            
            {/* Logout dropdown */}
            <div className="absolute right-0 mt-1 w-full min-w-[200px] bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogoutOutlined />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </Col>
      </Row>
    </header>
  );
};

export default Navbar;