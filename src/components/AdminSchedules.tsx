import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminCard from './AdminCard';
import { adminAPI } from '../services/apiService';

interface Schedule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  Module?: {
    module_code: string;
    module_name: string;
  };
  Venue?: {
    room_num: string;
    campus: string;
  };
  StudentGroup?: {
    group_code: string;
    group_name: string;
  };
}

const AdminSchedules: React.FC = () => {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const schedulesData = await adminAPI.getSchedules();
            setSchedules(schedulesData);
        } catch (error) {
            console.error('Error loading schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (scheduleId: string) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            try {
                await adminAPI.deleteSchedule(scheduleId);
                loadData(); // Reload the schedules after deletion
            } catch (error) {
                console.error('Error deleting schedule:', error);
                alert('Failed to delete schedule');
            }
        }
    };

    const handleAddSchedule = () => {
        // Navigate to schedule creation page or open a modal
        // For now, just show an alert
        alert('Add schedule functionality coming soon!');
    };

    if (loading) return <div className="p-4">Loading schedules...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center space-x-4 mb-6">
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Schedules Management</h1>
                </div>

                <AdminCard title="Schedules Management">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">Manage class schedules and timetables</p>
                        <button 
                            onClick={handleAddSchedule}
                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusCircle className="w-5 h-5 mr-1" /> Add Schedule
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No schedules found. Create your first schedule!
                                        </td>
                                    </tr>
                                ) : (
                                    schedules.map((schedule) => (
                                        <tr key={schedule.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                {schedule.Module?.module_code || 'N/A'}
                                                {schedule.Module?.module_name && (
                                                    <div className="text-xs text-gray-500">
                                                        {schedule.Module.module_name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {schedule.day_of_week}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {schedule.start_time} - {schedule.end_time}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {schedule.Venue?.room_num || 'N/A'}
                                                {schedule.Venue?.campus && (
                                                    <div className="text-xs text-gray-500">
                                                        {schedule.Venue.campus}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {schedule.StudentGroup?.group_code || 'N/A'}
                                                {schedule.StudentGroup?.group_name && (
                                                    <div className="text-xs text-gray-500">
                                                        {schedule.StudentGroup.group_name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm space-x-2">
                                                <button 
                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                    title="Edit schedule"
                                                >
                                                    <Edit2 className="w-4 h-4 inline" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(schedule.id)}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Delete schedule"
                                                >
                                                    <Trash2 className="w-4 h-4 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </AdminCard>
            </div>
        </div>
    );
};

export default AdminSchedules;