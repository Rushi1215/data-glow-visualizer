
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center">
              <Sparkles className="size-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              DataGlow
            </h1>
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
                        "flex items-center gap-2 text-sm font-medium transition-colors",
                        isActive 
                          ? "text-primary" 
                          : isDisabled 
                            ? "text-muted-foreground cursor-not-allowed" 
                            : "text-foreground/70 hover:text-foreground"
                      )}
                      onClick={e => isDisabled && e.preventDefault()}
                    >
                      <div className={cn(
                        "size-6 rounded-full border flex items-center justify-center",
                        isActive ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"
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
      
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          DataGlow &copy; {new Date().getFullYear()} - Data Cleaning & Visualization Tool
        </div>
      </footer>
    </div>
  );
};

export default DataGlowLayout;
