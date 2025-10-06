// File: src/components/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, Calendar, TrendingUp, Award, BookOpen, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { studentAPI } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
    profile: any;
    todayClasses: any[];
    recentAttendance: any[];
    stats: {
        totalClasses: number;
        attendanceRate: number;
        presentCount: number;
    };
}

interface TimetableEntry {
    id: string;
    weekDay: number;
    startTime: string;
    endTime: string;
    Module: {
        moduleCode: string;
        courseCode: string;
        User: {
            first_name: string; // Changed from first_name
            surname: string;
        };
    };
    Venue: {
        roomNum: string; // Changed from room_num
        campus: string;
    };
}

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [todayClasses, setTodayClasses] = useState<TimetableEntry[]>([]);
    const [currentClass, setCurrentClass] = useState<any>(null);

    useEffect(() => {
        if (user?.id) {
            loadDashboardData();
            loadTimetableData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        try {
            // Use the new endpoints
            const profileResponse = await fetch(`http://localhost:8000/api/student/profile?studentId=${user?.id}`);

            if (!profileResponse.ok) {
                throw new Error(`Profile API error: ${profileResponse.status}`);
            }

            const profileData = await profileResponse.json();

            const attendanceResponse = await fetch(`http://localhost:8000/api/student/attendance?studentId=${user?.id}`);
            let attendanceData = [];

            if (attendanceResponse.ok) {
                attendanceData = await attendanceResponse.json();
            }

            // Calculate stats
            const totalClasses = attendanceData.length || 0;
            const presentCount = attendanceData.filter((a: any) => a.attendance_status === 'present').length;
            const attendanceRate = totalClasses > 0 ? (presentCount / totalClasses * 100) : 0;

            setDashboardData({
                profile: profileData,
                todayClasses: [],
                recentAttendance: attendanceData.slice(0, 5) || [],
                stats: {
                    totalClasses,
                    attendanceRate: Math.round(attendanceRate),
                    presentCount
                }
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Fallback data using user context
            setDashboardData({
                profile: user,
                todayClasses: [],
                recentAttendance: [],
                stats: {
                    totalClasses: 0,
                    attendanceRate: 0,
                    presentCount: 0
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const loadTimetableData = async () => {
        if (!user?.id) return;

        try {
            const timetableData: TimetableEntry[] = await studentAPI.getStudentTimetable(user.id);

            // Handle empty or invalid data
            if (!Array.isArray(timetableData)) {
                setTodayClasses([]);
                setCurrentClass(null);
                return;
            }

            const today = new Date().getDay(); // 0=Sunday, 1=Monday, etc.

            // Filter today's classes with correct column names
            const todaysClasses = timetableData.filter(entry => {
                try {
                    return entry.weekDay === today; // Correct column name
                } catch (error) {
                    console.error('Error processing timetable entry:', error);
                    return false;
                }
            });

            setTodayClasses(todaysClasses);

            // Find current class with correct column names
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 8);

            const current = todaysClasses.find(cls => {
                try {
                    return cls.startTime <= currentTime && currentTime <= cls.endTime; // Correct column names
                } catch (error) {
                    console.error('Error checking class time:', error);
                    return false;
                }
            });

            setCurrentClass(current || null);
        } catch (error) {
            console.error('Error loading timetable:', error);
            setTodayClasses([]);
            setCurrentClass(null);
        }
    };



    const getCurrentTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    // Fix navigation functions
    const navigateTo = (path: string) => {
        navigate(path);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="text-center py-12">
                    <p className="text-gray-600">Unable to load dashboard data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {getCurrentTimeGreeting()}, {dashboardData.profile.first_name}!
                </h1>
                <p className="text-gray-600 mt-2">
                    Here's what's happening with your classes today.
                </p>
            </div>

            {/* Live Class Indicator */}
            {currentClass && (
                <motion.div
                    className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-2xl shadow-lg mb-6 flex justify-between items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <p className="text-sm font-semibold uppercase opacity-80">Class in Session Now!</p>
                        <h3 className="text-2xl font-extrabold">
                            {currentClass.Module.courseCode} ({currentClass.Module.moduleCode})
                        </h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {currentClass.Venue.roomNum}, {currentClass.Venue.campus} {/* Changed to roomNum */}
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatTime(currentClass.startTime)} - {formatTime(currentClass.endTime)}
                            </div>
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {currentClass.Module.User.first_name} {currentClass.Module.User.surname} {/* Changed to firstName */}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigateTo('/attendance')}
                        className="bg-white text-green-700 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                    >
                        <CheckCircle className="w-5 h-5 inline mr-2" /> CLOCK IN
                    </button>
                </motion.div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center space-x-3">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {dashboardData.stats.totalClasses}
                            </div>
                            <div className="text-gray-600 text-sm">Total Classes</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center space-x-3">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {dashboardData.stats.attendanceRate}%
                            </div>
                            <div className="text-gray-600 text-sm">Attendance Rate</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center space-x-3">
                        <Award className="w-8 h-8 text-orange-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {dashboardData.stats.presentCount}
                            </div>
                            <div className="text-gray-600 text-sm">Present Days</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center space-x-3">
                        <BookOpen className="w-8 h-8 text-purple-600" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {todayClasses.length}
                            </div>
                            <div className="text-gray-600 text-sm">Today's Classes</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Classes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Classes</h2>
                        <div className="space-y-4">
                            {todayClasses.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No classes scheduled for today.</p>
                            ) : (
                                todayClasses.map((classItem, index) => (
                                    <motion.div
                                        key={classItem.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${currentClass?.id === classItem.id
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-gray-50 border-gray-200'
                                            }`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {classItem.Module.module_name}
                                            </h3>
                                            <p className="text-blue-600 text-sm font-medium">
                                                {classItem.Module.module_code}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    {classItem.Venue.room_num}, {classItem.Venue.campus}
                                                </div>
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 mr-1" />
                                                    {classItem.Module.User.first_name} {classItem.Module.User.surname}
                                                </div>
                                            </div>
                                        </div>
                                        {currentClass?.id === classItem.id && (
                                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                Live
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Attendance */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Attendance</h2>
                        <div className="space-y-3">
                            {dashboardData.recentAttendance.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No attendance records yet.</p>
                            ) : (
                                dashboardData.recentAttendance.map((record, index) => (
                                    <motion.div
                                        key={record.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                {record.Event?.Schedule?.Module?.module_code || 'Unknown Class'}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {new Date(record.timestamp).toLocaleDateString()} at {new Date(record.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.attendance_status === 'present'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {record.attendance_status === 'present' ? 'Present' : 'Absent'}
                                        </span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Student Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigateTo('/timetable')}
                                className="w-full text-left p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                            >
                                <Calendar className="w-5 h-5 mr-3" />
                                View My Timetable
                            </button>
                            <button
                                onClick={() => navigateTo('/attendance')}
                                className="w-full text-left p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center"
                            >
                                <CheckCircle className="w-5 h-5 mr-3" />
                                Check-In to Class
                            </button>
                            <button
                                onClick={() => navigateTo('/degree-selection')}
                                className="w-full text-left p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center"
                            >
                                <Award className="w-5 h-5 mr-3" />
                                Degree Selection
                            </button>
                            <button
                                onClick={() => navigateTo('/history')}
                                className="w-full text-left p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors flex items-center"
                            >
                                <TrendingUp className="w-5 h-5 mr-3" />
                                Attendance History
                            </button>
                        </div>
                    </div>
                </div>

                {/* Student Info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Student Number:</span>
                            <span className="font-medium">{dashboardData.profile.student_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Program:</span>
                            <span className="font-medium">{dashboardData.profile.StudentGroup?.group_name || 'Not assigned'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Group Code:</span>
                            <span className="font-medium">{dashboardData.profile.StudentGroup?.group_code || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{dashboardData.profile.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Role:</span>
                            <span className="font-medium capitalize">{dashboardData.profile.role}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;