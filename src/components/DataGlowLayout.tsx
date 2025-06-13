
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DataGlowLayoutProps {
  children: React.ReactNode;
}

const DataGlowLayout: React.FC<DataGlowLayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  
  const steps = [
    { name: "Upload", path: "/" },
    { name: "Clean", path: "/clean" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-afacad bg-slate-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="/lovable-uploads/7059121f-19a5-499a-8aa8-4aa20188f8be.png" 
                alt="The Baap Company Logo" 
                className="size-12 rounded-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-800">
                BaapGlow
              </h1>
              <p className="text-xs text-slate-600 font-medium tracking-wide">
                BY THE BAAP COMPANY
              </p>
            </div>
          </Link>
          
          <nav className="hidden md:flex">
            <ul className="flex gap-8">
              {steps.map((step, index) => {
                const isActive = path === step.path;
                const isDisabled = (
                  (step.path === "/clean" && !localStorage.getItem("dataGlowFile")) ||
                  (step.path === "/dashboard" && !localStorage.getItem("dataGlowCleanedFile"))
                );
                
                return (
                  <li key={index}>
                    <Link 
                      to={isDisabled ? "#" : step.path}
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-colors font-afacad",
                        isActive 
                          ? "text-primary" 
                          : isDisabled 
                            ? "text-muted-foreground cursor-not-allowed" 
                            : "text-slate-600 hover:text-primary"
                      )}
                      onClick={e => isDisabled && e.preventDefault()}
                    >
                      <div className={cn(
                        "size-6 rounded-full border flex items-center justify-center font-semibold text-xs",
                        isActive 
                          ? "border-primary text-primary bg-primary/10" 
                          : "border-slate-300 text-slate-600"
                      )}>
                        {index + 1}
                      </div>
                      <span>{step.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        {children}
      </main>
      
      <footer className="border-t py-6 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/ed91df16-69f7-4345-b233-5796bbb3ffcd.png" 
                alt="The Baap Company" 
                className="h-8 object-contain"
              />
            </div>
            <div className="text-center text-sm text-slate-700 font-medium">
              BaapGlow &copy; {new Date().getFullYear()} - Professional Data Solutions by The Baap Company
            </div>
            <div className="text-xs text-slate-600 font-medium">
              BUSINESS APPLICATIONS AND PLATFORMS
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DataGlowLayout;
