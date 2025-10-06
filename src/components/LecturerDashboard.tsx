// File: src/components/LecturerDashboard.tsx
// --- FINAL, PROFESSIONAL, DATA-DRIVEN VERSION ---

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import AdminCard from './AdminCard';
import { BarChart3, UserCheck } from 'lucide-react';

const LecturerDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  const renderLecturerPage = () => {
    switch(currentPage) {
      case 'dashboard': return <LecturerAnalytics />;
      case 'attendance': return <StudentAttendanceView />;
      default: return <LecturerAnalytics />;
    }
  };

  const lecturerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'attendance', label: 'Student Attendance', icon: UserCheck },
  ];

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage} navItems={lecturerNavItems}>
      {renderLecturerPage()}
    </Layout>
  );
};

// Main dashboard view for the lecturer
const LecturerAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Lecturer Dashboard</h1>
      <p>Overview and analytics for your modules.</p>
      {/* This would be populated with real, aggregated data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard title="APPD101 - Attendance Rate"><p className="text-4xl font-bold text-green-600">92%</p></AdminCard>
        <AdminCard title="Students At Risk"><p className="text-4xl font-bold text-orange-500">4</p></AdminCard>
      </div>
    </div>
  );
};

// Component to show detailed, real attendance data
const StudentAttendanceView: React.FC = () => {
    const { user } = useAuth();
    const [modules, setModules] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchAttendance = async () => {
            if (!user) return;
            // Fetch the attendance for all modules taught by this lecturer
            const res = await fetch(`http://localhost:8000/api/lecturer/dashboard-data?lecturerId=${user.id}`);
            const data = await res.json();
            setModules(data);
        };
        if (user) fetchAttendance();
    }, [user]);

    return (
        <AdminCard title="Student Attendance Records">
            {modules.map(module => (
                <div key={module.id} className="mb-8">
                    <h3 className="text-xl font-bold">{module.moduleCode}</h3>
                    <table className="min-w-full bg-white border mt-2">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-2 px-4 border-b">Student</th>
                                <th className="py-2 px-4 border-b">Student Number</th>
                                <th className="py-2 px-4 border-b">Attendance Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {module.StudentModule.map((enrolment: any) => (
                                <tr key={enrolment.User.id}>
                                    <td className="py-2 px-4 border-b">{enrolment.User.first_name} {enrolment.User.surname}</td>
                                    <td className="py-2 px-4 border-b">{enrolment.User.student_num}</td>
                                    <td className="py-2 px-4 border-b font-semibold">{enrolment.User.Attendance.length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </AdminCard>
    );
};

export default LecturerDashboard;