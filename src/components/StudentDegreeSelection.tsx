import React, { useState, useEffect } from 'react';
import { degreeService } from '../services/degreeService';
import { DegreeProgram, Stream, AcademicYear, StudentEnrollment } from '../types';
import { useAuth } from '../contexts/AuthContext'; // Use your existing AuthContext

export const StudentDegreeSelection: React.FC = () => {
  const { user } = useAuth(); // Changed from useUser to useAuth
  const [degrees, setDegrees] = useState<DegreeProgram[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [selectedDegree, setSelectedDegree] = useState<number>();
  const [selectedStream, setSelectedStream] = useState<number>();
  const [selectedYear, setSelectedYear] = useState<number>();
  const [enrollment, setEnrollment] = useState<StudentEnrollment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
    checkExistingEnrollment();
  }, [user]);

  const loadInitialData = async () => {
    try {
      const degreesData = await degreeService.getDegrees();
      setDegrees(degreesData);
      
      // Mock years for now
      setYears([
        {
          id: 1, year_name: 'First Year', year_number: 1, created_at: '',
          start_date: undefined,
          end_date: undefined
        },
        {
          id: 2, year_name: 'Second Year', year_number: 2, created_at: '',
          start_date: undefined,
          end_date: undefined
        },
        {
          id: 3, year_name: 'Third Year', year_number: 3, created_at: '',
          start_date: undefined,
          end_date: undefined
        },
        {
          id: 4, year_name: 'Fourth Year', year_number: 4, created_at: '',
          start_date: undefined,
          end_date: undefined
        },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const checkExistingEnrollment = async () => {
    if (!user) return;
    try {
      const enrollmentData = await degreeService.getStudentEnrollment(user.id);
      setEnrollment(enrollmentData);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleDegreeChange = async (degreeId: number) => {
    setSelectedDegree(degreeId);
    setSelectedStream(undefined);
    try {
      const streamsData = await degreeService.getStreams(degreeId);
      setStreams(streamsData);
    } catch (error) {
      console.error('Error loading streams:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user || !selectedDegree || !selectedStream || !selectedYear) {
      alert('Please select all fields');
      return;
    }

    setLoading(true);
    try {
      await degreeService.applyForEnrollment({
        user_id: user.id,
        degree_program_id: selectedDegree,
        stream_id: selectedStream,
        academic_year_id: selectedYear
      });
      alert('Enrollment application submitted! Waiting for admin approval.');
      await checkExistingEnrollment();
    } catch (error) {
      alert('Error submitting enrollment application');
    } finally {
      setLoading(false);
    }
  };

  // If already enrolled, show enrollment info
  if (enrollment) {
    const degreeName = (enrollment as any).DegreeProgram?.name || 'N/A';
    const streamName = (enrollment as any).Stream?.name || 'N/A';
    const yearName = (enrollment as any).AcademicYear?.year_name || 'N/A';

    return (
      <div className="p-6 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Current Enrollment</h2>
        <p><strong>Degree:</strong> {degreeName}</p>
        <p><strong>Stream:</strong> {streamName}</p>
        <p><strong>Year:</strong> {yearName}</p>
        <p><strong>Status:</strong> <span className={`px-2 py-1 rounded ${enrollment.status === 'approved' ? 'bg-green-200' : 'bg-yellow-200'}`}>
          {enrollment.status}
        </span></p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Select Your Degree Program</h2>
      
      <div className="space-y-4">
        {/* Degree Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Degree</label>
          <select 
            value={selectedDegree || ''} 
            onChange={(e) => handleDegreeChange(Number(e.target.value))}
            className="border p-2 rounded w-full"
          >
            <option value="">Choose a degree...</option>
            {degrees.map(degree => (
              <option key={degree.id} value={degree.id}>
                {degree.name} ({degree.code})
              </option>
            ))}
          </select>
        </div>

        {/* Stream Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Stream</label>
          <select 
            value={selectedStream || ''} 
            onChange={(e) => setSelectedStream(Number(e.target.value))}
            disabled={!selectedDegree}
            className="border p-2 rounded w-full disabled:bg-gray-100"
          >
            <option value="">Choose a stream...</option>
            {streams.map(stream => (
              <option key={stream.id} value={stream.id}>
                {stream.name} ({stream.code})
              </option>
            ))}
          </select>
        </div>

        {/* Year Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Academic Year</label>
          <select 
            value={selectedYear || ''} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border p-2 rounded w-full"
          >
            <option value="">Choose academic year...</option>
            {years.map(year => (
              <option key={year.id} value={year.id}>
                {year.year_name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleEnroll}
          disabled={loading || !selectedDegree || !selectedStream || !selectedYear}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Submitting...' : 'Apply for Enrollment'}
        </button>
      </div>
    </div>
  );
};