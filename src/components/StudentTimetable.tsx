import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, MapPin, User, UserCheck } from 'lucide-react';

interface TimetableEntry {
    id: string;
    day_of_week: number; // 1=Monday, 7=Sunday
    start_time: string; // HH:MM:SS
    end_time: string;   // HH:MM:SS
    entry_type: 'Lecture' | 'Practical' | 'Tutorial';
    Module: {
        module_code: string;
        module_name: string;
        User: { first_name: string; surname: string }; // Lecturer
    };
    Venue: {
        room_num: string;
        campus: string;
        latitude: number;
        longitude: number;
    };
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const StudentTimetable: React.FC = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [currentClass, setCurrentClass] = useState<TimetableEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const loadTimetable = async (studentId: string) => {
        try {
            const timetableData: TimetableEntry[] = await studentAPI.getStudentTimetable(studentId);

            // Handle empty or invalid data
            if (!Array.isArray(timetableData)) {
                setTimetable([]);
                return;
            }

            // Filter out invalid entries
            const validTimetable = timetableData.filter(entry =>
                entry &&
                typeof entry === 'object' &&
                entry.day_of_week !== undefined
            );

            setTimetable(validTimetable);
        } catch (error) {
            console.error('Error loading full timetable:', error);
            setTimetable([]);
        }
    };

    const loadCurrentClass = async (studentId: string) => {
        try {
            const classData: TimetableEntry | null = await studentAPI.getCurrentClass(studentId);

            // Only set if we have valid data
            if (classData && typeof classData === 'object' && Object.keys(classData).length > 0) {
                setCurrentClass(classData);
            } else {
                setCurrentClass(null);
            }
        } catch (error) {
            console.error('Error loading current class:', error);
            setCurrentClass(null);
        }
    }

    useEffect(() => {
        if (!user || !user.id) return;
        setLoading(true);
        loadTimetable(user.id);
        loadCurrentClass(user.id);
        setLoading(false);

        // Update current class every minute
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
            loadCurrentClass(user.id);
        }, 60000);

        return () => clearInterval(intervalId);
    }, [user]);

    const handleClockIn = (scheduleId: string) => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser for clock-in.');
            return;
        }

        // Get user's current location
        navigator.geolocation.getCurrentPosition(async (position) => {
            const userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };

            // NOTE: You need a CameraCapture component or service to capture the face image first.
            // For now, we simulate the image data needed for the backend /verify endpoint.
            alert("Simulating face capture and sending verification request...");

            // This assumes the frontend captures a base64 image and passes it to the API
            const dummyImageData = "data:image/jpeg;base64,..."; // Placeholder

            try {
                const result = await studentAPI.submitAttendance({
                    image_data: dummyImageData,
                    schedule_id: scheduleId,
                    location: userLocation,
                });
                alert(result.message);
                if (user) {
                    loadCurrentClass(user.id); // Refresh status after attempt
                }
            } catch (error: any) {
                alert(`Clock-in Failed: ${error.message || 'Server error.'}`);
            }

        }, (error) => {
            alert(`Geolocation error: ${error.message}`);
        });
    };

    const isToday = (dayOfWeek: number) => {
        const today = currentTime.getDay(); // 0=Sunday, 6=Saturday
        return dayOfWeek === today;
    };

    const getFormattedTime = (timeString: string) => {
        try {
            // Converts HH:MM:SS string to HH:MM format (local time)
            return timeString.substring(0, 5);
        } catch {
            return 'N/A';
        }
    };

    const classesGrouped = timetable.reduce((acc, entry) => {
        const dayName = dayNames[entry.day_of_week];
        if (!acc[dayName]) acc[dayName] = [];
        acc[dayName].push(entry);
        return acc;
    }, {} as Record<string, TimetableEntry[]>);


    if (loading) return <div className="p-6">Loading personalized timetable...</div>;

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-3xl font-bold mb-4">Personalized Timetable</h2>

            {/* Live Class Indicator */}
            {currentClass && (
                <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-5 rounded-xl shadow-lg flex justify-between items-center animate-pulse-slow">
                    <div>
                        <p className="text-sm font-semibold uppercase opacity-80">Class in Session Now!</p>
                        <h3 className="text-2xl font-extrabold">{currentClass.Module.module_name} ({currentClass.Module.module_code})</h3>
                        <p className="flex items-center text-sm mt-1">
                            <MapPin className="w-4 h-4 mr-1" /> {currentClass.Venue.room_num}, {currentClass.Venue.campus}
                        </p>
                        <p className="flex items-center text-sm mt-1">
                            <Clock className="w-4 h-4 mr-1" /> {getFormattedTime(currentClass.start_time)} - {getFormattedTime(currentClass.end_time)}
                        </p>
                    </div>
                    <button
                        onClick={() => handleClockIn(currentClass.id)}
                        className="bg-white text-green-700 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors transform hover:scale-105"
                    >
                        <UserCheck className="w-5 h-5 inline mr-2" /> CLOCK IN
                    </button>
                </div>
            )}

            {/* Timetable Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(classesGrouped).sort(([dayA], [dayB]) => dayNames.indexOf(dayA) - dayNames.indexOf(dayB)).map(([day, classes]) => (
                    <div key={day} className={`rounded-xl p-4 shadow-md ${isToday(dayNames.indexOf(day)) ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white border border-gray-100'}`}>
                        <h3 className="font-extrabold text-lg mb-3 border-b pb-2 text-gray-800">{day}</h3>

                        {classes.length === 0 ? (
                            <p className="text-gray-500 text-sm">No classes scheduled.</p>
                        ) : (
                            <div className="space-y-3">
                                {classes.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-3 rounded-lg border-l-4 ${currentClass?.id === item.id
                                                ? 'bg-green-100 border-green-500 shadow-md'
                                                : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <h4 className="font-semibold text-base leading-tight">{item.Module.module_name}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{item.entry_type} | {item.Module.module_code}</p>
                                        <div className="mt-2 text-xs space-y-0.5">
                                            <p className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {getFormattedTime(item.start_time)} - {getFormattedTime(item.end_time)}</p>
                                            <p className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {item.Venue.room_num}, {item.Venue.campus}</p>
                                            <p className="flex items-center"><User className="w-3 h-3 mr-1" /> {item.Module.User.first_name} {item.Module.User.surname}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
