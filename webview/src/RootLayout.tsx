import React from 'react';
import { Outlet } from 'react-router-dom';

export const RootLayout: React.FC = () => {
  return (
    <div className="relative bg-[#0e0f0e] flex flex-col justify-between w-full min-h-screen">
      {/* Header có thể thêm vào đây nếu cần */}
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* Footer có thể thêm vào đây nếu cần */}
    </div>
  );
};
