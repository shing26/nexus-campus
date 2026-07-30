import { motion } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
     <main className="flex-1">
       <motion.div
         initial={{ opacity: 0, y: 6 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
       >
         <Outlet />
       </motion.div>
     </main>
      <Footer />
    </div>
  );
}
