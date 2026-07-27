 import { Link } from 'react-router-dom';
 
 const channels = [
   { slug: 'announcements', label: '公告' },
   { slug: 'prompts', label: 'Prompt 工坊' },
   { slug: 'showcase', label: '作品展示' },
   { slug: 'agents', label: 'Agent 实战' },
   { slug: 'vibe-coding', label: 'Vibe Coding' },
   { slug: 'debug', label: '代码急诊室' },
   { slug: 'resources', label: '资源聚合' },
 ];
 
 interface SidebarProps {
   className?: string;
 }
 
 export default function Sidebar({ className = '' }: SidebarProps) {
   return (
     <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-4 ${className}`}>
       <div>
         <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">频道</h3>
         <nav className="space-y-1">
           {channels.map(ch => (
             <Link
               key={ch.slug}
               to={'/channel/' + ch.slug}
               className="block text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-1"
             >
               {ch.label}
             </Link>
           ))}
         </nav>
       </div>
       <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
         <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">快捷</h3>
         <Link to="/post/new" className="block text-sm font-medium text-emerald-600 hover:text-emerald-500 py-1">✏️ 写帖子</Link>
         <Link to="/tags" className="block text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 py-1">🏷️ 标签</Link>
       </div>
     </div>
   );
 }
