import React, { useState, useEffect } from 'react';
import AdminCard from './AdminCard';
import { adminAPI } from '../services/apiService';
import { PlusCircle, Upload, Trash2, MapPin } from 'lucide-react'; // Changed Calendar to MapPin for clarity
import { StudentGroup, Module, Venue } from '../types';
import Modal from './Modal';

interface ScheduleEntry {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    entry_type: string;
    module_id: string;
    venue_id: string;
    student_group_id: string;
    // Joined data (assuming these might not always be present):
    module?: { module_code: string; module_name: string; };
    venue?: { room_num: string; campus: string; };
    group?: { group_code: string; group_name: string; };
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AdminTimetableManagement: React.FC = () => {
    const [allSchedules, setAllSchedules] = useState<ScheduleEntry[]>([]);
    const [groups, setGroups] = useState<StudentGroup[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        module_id: '',
        venue_id: '',
        day_of_week: 1,
        start_time: '08:00',
        end_time: '09:00',
        entry_type: 'Lecture',
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [schedulesData, groupsData, modulesData, venuesData] = await Promise.all([
                adminAPI.getSchedules(),
                adminAPI.getStudentGroups(),
                adminAPI.getModules(),
                adminAPI.getVenues(),
            ]);
            setAllSchedules(schedulesData);
            setGroups(groupsData);
            setModules(modulesData);
            setVenues(venuesData);

            if (groupsData.length > 0 && !selectedGroupId) {
                setSelectedGroupId(groupsData[0].id);
            }
        } catch (err) {
            setError('Failed to load necessary data for timetable management.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                day_of_week: parseInt(String(formData.day_of_week)),
                student_group_id: selectedGroupId,
            };
            await adminAPI.createSchedule(dataToSubmit);
            setIsModalOpen(false);
            loadData(); // Refresh data
        } catch (err) {
            setError('Failed to create schedule entry.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this schedule entry?')) {
            try {
                await adminAPI.deleteSchedule(id);
                loadData();
            } catch (err) {
                setError('Failed to delete schedule.');
            }
        }
    };

    const filteredSchedules = allSchedules.filter(s => s.student_group_id === selectedGroupId)
        .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time));

    const schedulesByDay = filteredSchedules.reduce((acc, schedule) => {
        const day = dayNames[schedule.day_of_week];
        if (!acc[day]) acc[day] = [];
        acc[day].push(schedule);
        return acc;
    }, {} as Record<string, ScheduleEntry[]>);


    if (loading) return <div className="p-6">Loading timetable data...</div>;
    if (error) return <div className="p-6 text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;

    return (
        <AdminCard title="Timetable Management">
            {/* Group Selector and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50 gap-4">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <label htmlFor="group-select" className="font-medium text-slate-700 whitespace-nowrap">View Timetable For:</label>
                    <select
                        id="group-select"
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                        {groups.map(group => (
                            <option key={group.id} value={group.id}>{group.group_code} - {group.group_name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Entry
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm">
                        <Upload className="w-4 h-4 mr-2" /> Bulk Upload
                    </button>
                </div>
            </div>

            {/* Timetable View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                {dayNames.slice(1, 6).map(day => ( // Monday to Friday
                    <div key={day} className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 border-b border-slate-200 pb-2 text-indigo-800">{day}</h3>
                        
                        {schedulesByDay[day] && schedulesByDay[day].length > 0 ? (
                            <div className="space-y-3">
                                {schedulesByDay[day].map(schedule => {
                                    const module = modules.find(m => m.id === schedule.module_id);
                                    const venue = venues.find(v => v.id === schedule.venue_id);
                                    return (
                                        <div key={schedule.id} className="p-3 rounded-lg border-l-4 border-indigo-500 bg-slate-50 hover:shadow-md hover:border-indigo-600 transition-all duration-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-sm text-slate-800 leading-tight">{module?.module_code || 'N/A'} - {schedule.entry_type}</h4>
                                                    <p className="text-xs text-slate-600">{schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}</p>
                                                    <p className="text-xs text-slate-500 flex items-center mt-1">
                                                        <MapPin className="w-3 h-3 mr-1.5" /> {venue?.room_num} ({venue?.campus})
                                                    </p>
                                                </div>
                                                <button onClick={() => handleDelete(schedule.id)} className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-24">
                                <p className="text-slate-500 text-sm">No classes scheduled.</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>


            {/* Modal for Add New Entry */}
            <Modal title="Add New Schedule Entry" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     {/* Helper text */}
                     <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-md">
                        You are adding a new schedule entry for the <span className="font-bold">{groups.find(g => g.id === selectedGroupId)?.group_code}</span> group.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Module</label>
                            <select name="module_id" value={formData.module_id} onChange={(e) => setFormData({...formData, module_id: e.target.value})} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">Select Module</option>
                                {modules.map(module => (
                                    <option key={module.id} value={module.id}>{module.module_code} - {module.module_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Venue</label>
                            <select name="venue_id" value={formData.venue_id} onChange={(e) => setFormData({...formData, venue_id: e.target.value})} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">Select Venue</option>
                                {venues.map(venue => (
                                    <option key={venue.id} value={venue.id}>{venue.room_num} ({venue.campus})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Day of Week</label>
                        <select name="day_of_week" value={formData.day_of_week} onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                            {dayNames.slice(1, 6).map((day, index) => <option key={index + 1} value={index + 1}>{day}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                            <input type="time" name="start_time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                            <input type="time" name="end_time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select name="entry_type" value={formData.entry_type} onChange={(e) => setFormData({...formData, entry_type: e.target.value})} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option>Lecture</option>
                                <option>Practical</option>
                                <option>Tutorial</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Create Schedule Entry
                    </button>
                </form>
            </Modal>
        </AdminCard>
    );
};

export default AdminTimetableManagement;