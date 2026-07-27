 import { useEffect } from 'react';
 import { BrowserRouter, Routes, Route } from 'react-router-dom';
 import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
 import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
 import { useThemeStore } from './stores/themeStore';
 import MainLayout from './components/layout/MainLayout';
 import AdminLayout from './components/layout/AdminLayout';
 import AdminRouteGuard from './components/AdminRouteGuard';
 import HomePage from './pages/HomePage';
 import ChannelPage from './pages/ChannelPage';
 import PostDetailPage from './pages/PostDetailPage';
 import CreatePostPage from './pages/CreatePostPage';
 import EditPostPage from './pages/EditPostPage';
 import SearchPage from './pages/SearchPage';
 import LoginPage from './pages/LoginPage';
 import RegisterPage from './pages/RegisterPage';
 import UserProfilePage from './pages/UserProfilePage';
 import SettingsPage from './pages/SettingsPage';
 import MessagesPage from './pages/MessagesPage';
 import AuditPage from './pages/AuditPage';
 import DashboardPage from './pages/DashboardPage';
 
 const queryClient = new QueryClient({
   defaultOptions: {
     queries: {
       staleTime: 1000 * 60 * 5,
       retry: 1,
       refetchOnWindowFocus: false,
     },
   },
 });
 
 export default function App() {
   const dark = useThemeStore((s) => s.dark);
 
   useEffect(() => {
     document.documentElement.classList.toggle('dark', dark);
   }, [dark]);
 
   return (
     <QueryClientProvider client={queryClient}>
       <BrowserRouter>
         <Routes>
           <Route element={<MainLayout />}>
             <Route path="/" element={<HomePage />} />
             <Route path="/channel/:slug" element={<ChannelPage />} />
             <Route path="/post/:id" element={<PostDetailPage />} />
             <Route path="/post/new" element={<CreatePostPage />} />
             <Route path="/post/:id/edit" element={<EditPostPage />} />
             <Route path="/search" element={<SearchPage />} />
             <Route path="/login" element={<LoginPage />} />
             <Route path="/register" element={<RegisterPage />} />
             <Route path="/user/:id" element={<UserProfilePage />} />
             <Route path="/user/settings" element={<SettingsPage />} />
             <Route path="/user/messages" element={<MessagesPage />} />
           </Route>
           <Route element={<AdminLayout />}>
             <Route element={<AdminRouteGuard />}>
               <Route path="/admin/audit" element={<AuditPage />} />
               <Route path="/admin/dashboard" element={<DashboardPage />} />
             </Route>
           </Route>
         </Routes>
       </BrowserRouter>
       <ReactQueryDevtools initialIsOpen={false} />
     </QueryClientProvider>
   );
 }
