import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-white/50 backdrop-blur-lg border border-gray-100 shadow-sm rounded-2xl w-full">
    <div className="flex bg-blue-50 text-blue-500 p-4 rounded-full mb-4 shadow-inner ring-1 ring-blue-100/50">
      {icon ? icon : <PackageOpen size={32} className="stroke-[1.5]" />}
    </div>
    <h3 className="text-xl font-semibold text-gray-800 tracking-tight">{title}</h3>
    <p className="mt-2 text-sm text-gray-500 max-w-sm mb-6">{description}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);
