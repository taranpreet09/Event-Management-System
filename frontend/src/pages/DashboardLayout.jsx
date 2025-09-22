import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-[calc(100vh-150px)]">
      <Sidebar />
      <main className="flex-grow p-8 bg-gray-50">
        <Outlet /> {/* Child routes will be rendered here */}
      </main>
    </div>
  );
};

export default DashboardLayout;