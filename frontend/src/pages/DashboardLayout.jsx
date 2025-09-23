import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion'; 
const DashboardLayout = () => {
  return (
    <div className="flex min-h-[calc(100vh-150px)]">
      <Sidebar />
      {/* --- 2. Replace 'main' with 'motion.main' and add animation props --- */}
      <motion.main 
        className="flex-grow p-8 bg-gray-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default DashboardLayout;