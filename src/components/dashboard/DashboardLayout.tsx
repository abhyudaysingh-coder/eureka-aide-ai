import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ParticleBackground } from "../ParticleBackground";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      <ParticleBackground />
      <Sidebar />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="container max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
