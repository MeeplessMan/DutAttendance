import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, TrendingUp, Award } from 'lucide-react';
import { AttendanceService } from '../services/attendanceService';
import { AttendanceRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const AttendanceHistory: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.studentId) {
      loadAttendanceHistory();
    }
  }, [user]);

  const loadAttendanceHistory = async () => {
    if (!user?.studentId) return;
    
    try {
      const data = await AttendanceService.getAttendanceHistory(user.studentId);
      setRecords(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Error loading attendance history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TIME': return 'bg-green-100 text-green-800 border-green-200';
      case 'LATE': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'OUT_OF_WINDOW': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ON_TIME': return 'On Time';
      case 'LATE': return 'Late';
      case 'OUT_OF_WINDOW': return 'Missed';
      default: return status;
    }
  };

  const calculateStats = () => {
    const total = records.length;
    const onTime = records.filter(r => r.status === 'ON_TIME').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const attendance = total > 0 ? Math.round(((onTime + late) / total) * 100) : 0;
    const punctuality = total > 0 ? Math.round((onTime / total) * 100) : 0;

    return { total, onTime, late, attendance, punctuality };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance History</h1>
          <p className="text-gray-600">View your attendance records and statistics</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-2xl h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance History</h1>
        <p className="text-gray-600">View your attendance records and statistics</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          className="bg-white rounded-2xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-gray-600 text-sm">Total Classes</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-2xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.attendance}%</div>
              <div className="text-gray-600 text-sm">Attendance Rate</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-2xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.punctuality}%</div>
              <div className="text-gray-600 text-sm">Punctuality</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-2xl p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <Award className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.onTime}</div>
              <div className="text-gray-600 text-sm">On-Time Arrivals</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Attendance Records */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Attendance</h2>
        
        {records.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Attendance Records</h3>
            <p className="text-gray-600">Your attendance history will appear here after you check in to lectures.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => (
              <motion.div
                key={record.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Lecture ID: {record.lectureId}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {format(new Date(record.timestamp), 'MMM dd, yyyy • h:mm a')}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {record.location.distance.toFixed(0)}m from venue
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(record.status)}`}>
                    {getStatusLabel(record.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {(record.verificationScore != null ? (record.verificationScore * 100).toFixed(1) : '0')}%
                    </div>
                    <div className="text-gray-600 text-sm">Verification Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {record.location.latitude.toFixed(4)}°
                    </div>
                    <div className="text-gray-600 text-sm">Latitude</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {record.location.longitude.toFixed(4)}°
                    </div>
                    <div className="text-gray-600 text-sm">Longitude</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;