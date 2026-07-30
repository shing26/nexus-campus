import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '../Sidebar';

export default function AdminLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <Outlet />
      </main>
    </div>
  );
}
