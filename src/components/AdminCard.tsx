import React from 'react';

interface AdminCardProps {
    title: string;
    children: React.ReactNode;
    // Optional prop to remove internal padding if the child needs full width
    padding?: boolean; 
}

const AdminCard: React.FC<AdminCardProps> = ({ title, children, padding = true }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
        <div className={padding ? "p-6" : ""}>
            {children}
        </div>
    </div>
);

export default AdminCard;