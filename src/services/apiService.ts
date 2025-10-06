import { AcademicYear, Course, DegreeProgram, Module, StudentEnrollment, Stream, StudentGroup, User, Venue } from '../types';
// NOTE: Use your actual backend URL here. Assuming Flask is running on 8000.
const API_URL = 'http://localhost:8000/api';

/**
 * Helper function to handle fetch requests and parse JSON responses.
 */
const fetchData = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    let errorData: any = { message: `HTTP Error: ${response.statusText}`, status: response.status };
    // Attempt to parse JSON error message from backend
    if (contentType && contentType.indexOf("application/json") !== -1) {
      errorData = await response.json();
      // Assuming Flask returns {'error': '...'} structure
      if (errorData && errorData.error) {
        // Parse the specific Supabase/PostgREST error message for clearer debugging
        try {
          const errorJson = JSON.parse(errorData.error.replace(/'/g, '"'));
          errorData.message = errorJson.message || errorData.error;
        } catch {
          errorData.message = errorData.error;
        }
      }
    }
    console.error('API Error:', url, errorData);
    throw errorData;
  }

  if (contentType && contentType.indexOf("application/json") !== -1) {
    return await response.json();
  }
  return response.text();
};

// --- ADMIN API SERVICES ---
export const adminAPI = {
  // STATISTICS
  getDashboardStats: (): Promise<any> =>
    fetchData(`${API_URL}/admin/dashboard/stats`),

  // USERS
  getUsers: (role: string): Promise<User[]> =>
    fetchData(`${API_URL}/admin/users?role=${role}`),
  updateUser: (id: string, data: Partial<User>) =>
    fetchData(`${API_URL}/admin/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),

  updateUserEnrollmentStatus: (userId: string, data: { student_group_id: string; role?: string }) =>
    fetchData(`${API_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  
  // USER CREATION
  createUser: (data: { email: string; first_name: string; surname: string; student_num: string; faculty: string; role: string }) =>
    fetchData(`${API_URL}/admin/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  
  // USER DELETION
  deleteUser: (id: string) =>
    fetchData(`${API_URL}/admin/users/${id}`, { method: 'DELETE' }),

  // DEGREE CRUD
  getDegrees: (): Promise<DegreeProgram[]> =>
    fetchData(`${API_URL}/admin/degrees`),
  createDegree: (data: Partial<DegreeProgram>) =>
    fetchData(`${API_URL}/admin/degrees`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateDegree: (id: string, data: Partial<DegreeProgram>) =>
    fetchData(`${API_URL}/admin/degrees/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteDegree: (id: string) =>
    fetchData(`${API_URL}/admin/degrees/${id}`, { method: 'DELETE' }),

  // STREAM CRUD
  getStreams: (): Promise<Stream[]> =>
    fetchData(`${API_URL}/admin/streams`),
  createStream: (data: Partial<Stream>) =>
    fetchData(`${API_URL}/admin/streams`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateStream: (id: string, data: Partial<Stream>) =>
    fetchData(`${API_URL}/admin/streams/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteStream: (id: string) =>
    fetchData(`${API_URL}/admin/streams/${id}`, { method: 'DELETE' }),

  // ACADEMIC YEAR CRUD
  getAcademicYears: (): Promise<AcademicYear[]> =>
    fetchData(`${API_URL}/admin/academic-years`),
  createAcademicYear: (data: Partial<AcademicYear>) =>
    fetchData(`${API_URL}/admin/academic-years`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateAcademicYear: (id: string, data: Partial<AcademicYear>) =>
    fetchData(`${API_URL}/admin/academic-years/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteAcademicYear: (id: string) =>
    fetchData(`${API_URL}/admin/academic-years/${id}`, { method: 'DELETE' }),

  // STUDENT GROUP CRUD
  getStudentGroups: (): Promise<StudentGroup[]> =>
    fetchData(`${API_URL}/admin/student-groups`),
  createStudentGroup: (data: Partial<StudentGroup>) =>
    fetchData(`${API_URL}/admin/student-groups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateStudentGroup: (id: string, data: Partial<StudentGroup>) =>
    fetchData(`${API_URL}/admin/student-groups/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteStudentGroup: (id: string) =>
    fetchData(`${API_URL}/admin/student-groups/${id}`, { method: 'DELETE' }),

  // COURSE CRUD
  getCourses: (): Promise<Course[]> =>
    fetchData(`${API_URL}/admin/courses`),
  createCourse: (data: Partial<Course>) =>
    fetchData(`${API_URL}/admin/courses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateCourse: (id: string, data: Partial<Course>) =>
    fetchData(`${API_URL}/admin/courses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteCourse: (id: string) =>
    fetchData(`${API_URL}/admin/courses/${id}`, { method: 'DELETE' }),

  // MODULE CRUD
  getModules: (): Promise<Module[]> =>
    fetchData(`${API_URL}/admin/modules`),
  createModule: (data: Partial<Module>) =>
    fetchData(`${API_URL}/admin/modules`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateModule: (id: string, data: Partial<Module>) =>
    fetchData(`${API_URL}/admin/modules/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteModule: (id: string) =>
    fetchData(`${API_URL}/admin/modules/${id}`, { method: 'DELETE' }),

  // VENUE CRUD
  getVenues: (): Promise<Venue[]> =>
    fetchData(`${API_URL}/admin/venues`),
  createVenue: (data: Partial<Venue>) =>
    fetchData(`${API_URL}/admin/venues`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateVenue: (id: string, data: Partial<Venue>) =>
    fetchData(`${API_URL}/admin/venues/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteVenue: (id: string) =>
    fetchData(`${API_URL}/admin/venues/${id}`, { method: 'DELETE' }),

  // SCHEDULE CRUD
  getSchedules: (): Promise<any[]> =>
    fetchData(`${API_URL}/admin/schedules`),
  createSchedule: (data: any) =>
    fetchData(`${API_URL}/admin/schedules`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteSchedule: (id: string) =>
    fetchData(`${API_URL}/admin/schedules/${id}`, { method: 'DELETE' }),

  // ENROLLMENT APPROVAL
  getPendingEnrollments: (): Promise<StudentEnrollment[]> =>
    // This hits the NEW route we added to admin_routes.py
    fetchData(`${API_URL}/admin/student-enrollments?status=pending`),
  approveEnrollment: (enrollmentId: number, userId: string, studentGroupId: string) =>
    fetchData(`${API_URL}/admin/enrollments/${enrollmentId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, student_group_id: studentGroupId })
    }),
  rejectEnrollment: (enrollmentId: number) =>
    fetchData(`${API_URL}/admin/enrollments/${enrollmentId}/reject`, { method: 'POST' }),
};

// --- STUDENT API SERVICES ---
// STUDENT API SERVICES - Updated with better error handling
export const studentAPI = {
  // TIMETABLE - Handle empty responses gracefully
  getStudentTimetable: async (studentId: string): Promise<any[]> => {
    try {
      const data = await fetchData(`${API_URL}/student/timetable?studentId=${studentId}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error loading timetable, returning empty array:', error);
      return [];
    }
  },

  // CURRENT CLASS - Handle empty responses
  getCurrentClass: async (studentId: string): Promise<any> => {
    try {
      const data = await fetchData(`${API_URL}/student/current-class?studentId=${studentId}`);
      return data && typeof data === 'object' ? data : {};
    } catch (error) {
      console.error('Error loading current class, returning empty object:', error);
      return {};
    }
  },

  // ATTENDANCE - Handle empty responses
  submitAttendance: (data: { image_data: string, schedule_id: string, location: { latitude: number, longitude: number } }): Promise<any> =>
    fetchData(`${API_URL}/student/verify`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(data) 
    }),

  // Get dashboard data with error handling
  getDashboardData: async (studentId: string): Promise<any> => {
    try {
      return await fetchData(`${API_URL}/student/dashboard?studentId=${studentId}`);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      return null;
    }
  },

  // Get attendance history with error handling
  getAttendanceHistory: async (studentId: string): Promise<any> => {
    try {
      const data = await fetchData(`${API_URL}/student/attendance?studentId=${studentId}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error loading attendance history, returning empty array:', error);
      return [];
    }
  },
};