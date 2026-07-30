 export default function Footer() {
   return (
   <footer className="bg-vibe-surface border-t border-vibe-border mt-auto">
     <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
       <p className="text-center text-xs font-mono text-slate-500">
           &copy; {new Date().getFullYear()} Nexus-Vibe. All rights reserved.
         </p>
       </div>
     </footer>
   );
 }
