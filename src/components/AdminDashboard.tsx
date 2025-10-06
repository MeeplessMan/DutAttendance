import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  GraduationCap,
  CheckCircle,
  BarChart3,
  Building,
  School,
  Table
} from 'lucide-react';
import { adminAPI } from '../services/apiService';

// Define the type for the stats object
interface DashboardStats {
  total_students: number;
  total_lecturers: number;
  total_modules: number;
  total_schedules: number;
  active_student_groups: number;
  attendance_rate: number;
}

// --- Re-styled StatCard to match the desired screenshot ---
const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    description
}: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string; // e.g., 'bg-blue-500'
    description: string;
}) => (
    <div className={`rounded-xl shadow-sm overflow-hidden flex flex-col ${color}`}>
        <div className="p-5 text-white flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-3xl font-bold">{value}</p>
                    <p className="text-sm font-medium text-white/90">{title}</p>
                </div>
                <div className="bg-black/10 p-3 rounded-lg">
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
        <div className="bg-white/95 p-3 text-slate-700 text-sm font-medium">
            {description}
        </div>
    </div>
);

// --- Simplified Navigation Tab Component ---
const NavTab = ({
    title,
    icon: Icon,
    isActive,
    onClick,
    description
}: {
    title: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
    description: string;
}) => (
    <button
        onClick={onClick}
        className={`p-5 rounded-xl text-left transition-all duration-200 w-full group ${
          isActive ? 'bg-white shadow-md ring-2 ring-blue-500' : 'bg-slate-100 hover:bg-white hover:shadow-sm'
        }`}
    >
        <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-colors ${
              isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
            }`}>
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold ml-4 text-slate-800">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 mt-2">{description}</p>
    </button>
);

// --- Simplified Action Card for navigation inside tabs ---
const ActionCard = ({ title, icon: Icon, onClick, description }: { title: string; icon: React.ElementType; onClick: () => void; description: string; }) => (
    <button
      onClick={onClick}
      className="bg-slate-50 hover:bg-white hover:shadow-lg transition-all duration-300 p-6 rounded-xl border border-slate-200 text-center w-full group"
    >
      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto transition-colors group-hover:bg-blue-600 group-hover:text-white">
        <Icon className="w-6 h-6" />
      </div>
      <p className="font-semibold text-slate-800 mt-4">{title}</p>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </button>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'timetable'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminAPI.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div className="p-10 text-center text-slate-500">Loading statistics...</div>;
    }
    if (error) {
      return (
        <div className="p-6 text-red-700 bg-red-100 rounded-lg">
          {error}
          <button onClick={() => window.location.reload()} className="ml-4 bg-red-200 px-3 py-1 rounded-md text-sm">Retry</button>
        </div>
      );
    }
    if (!stats) {
      return <div className="p-10 text-center text-slate-500">No statistics available.</div>;
    }

    switch (activeTab) {
      case 'overview':
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={stats.total_students} icon={Users} color="bg-blue-500" description="Active enrolled students" />
                <StatCard title="Teaching Staff" value={stats.total_lecturers} icon={GraduationCap} color="bg-purple-500" description="Lecturers and instructors" />
                <StatCard title="Course Modules" value={stats.total_modules} icon={BookOpen} color="bg-green-500" description="Active course modules" />
                <StatCard title="Scheduled Classes" value={stats.total_schedules} icon={Calendar} color="bg-orange-500" description="Weekly scheduled sessions" />
                <StatCard title="Student Groups" value={stats.active_student_groups} icon={Users} color="bg-blue-500" description="Active student cohorts" />
                <StatCard title="System Status" value="Online" icon={CheckCircle} color="bg-green-500" description="All systems operational" />
                <StatCard title="Attendance Rate" value={`${stats.attendance_rate}%`} icon={TrendingUp} color="bg-blue-500" description="Overall attendance" />
            </div>
        );
      case 'academic':
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ActionCard title="Degrees" icon={GraduationCap} onClick={() => navigate('/admin/degrees')} description="Manage programs" />
                <ActionCard title="Streams" icon={BarChart3} onClick={() => navigate('/admin/streams')} description="Course specializations" />
                <ActionCard title="Academic Years" icon={Calendar} onClick={() => navigate('/admin/academic-years')} description="Manage school years" />
                <ActionCard title="Student Groups" icon={Users} onClick={() => navigate('/admin/student-groups')} description="Manage cohorts" />
            </div>
        );
      case 'timetable':
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard title="Schedules" icon={Table} onClick={() => navigate('/admin/schedules')} description="Manage timetables" />
                <ActionCard title="Modules" icon={BookOpen} onClick={() => navigate('/admin/modules')} description="Course scheduling" />
                <ActionCard title="Venues" icon={Building} onClick={() => navigate('/admin/venues')} description="Room management" />
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Comprehensive management system for your academic institution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <NavTab title="System Overview" icon={BarChart3} isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} description="Real-time system statistics" />
          <NavTab title="Academic Structure" icon={School} isActive={activeTab === 'academic'} onClick={() => setActiveTab('academic')} description="Manage degrees & streams" />
          <NavTab title="Timetable Manager" icon={Table} isActive={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} description="Schedules & venues" />
        </div>
        
        {/* The content is rendered inside a simple container for consistent padding */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;