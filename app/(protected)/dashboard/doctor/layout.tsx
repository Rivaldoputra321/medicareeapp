// app/doctor/layout.tsx
'use client';

import { useAuth } from '@/utils/useAuth';
import { Spin } from 'antd';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}