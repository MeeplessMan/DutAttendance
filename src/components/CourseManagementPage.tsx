import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import AdminCard from './AdminCard';

// It's better to move this to a dedicated `services/api.ts` file.
// For now, we'll keep it here but improve it slightly.
const apiClient = {
  get: async (path: string) => {
    const response = await fetch(`http://localhost:8000/api/admin${path}`);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
    return response.json();
  },
  post: async (path: string, body: any) => {
    const response = await fetch(`http://localhost:8000/api/admin${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Failed to create: ${response.statusText}`);
    return response.json();
  },
  // In src/components/CourseManagementPage.tsx, inside the apiClient object

delete: async (path: string, id: string) => {
    // The path should already be '/courses'
    const response = await fetch(`http://localhost:8000/api/admin${path}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Failed to delete: ${response.statusText}`);
},
};

// --- Step 1: Define a proper type for your data. No more 'any'! ---
// NOTE: Use snake_case to match your Python backend and Supabase columns.
interface Course {
  id: string;
  course_code: string;
  course_name: string;
  faculty: string;
}

const CourseManagementPage: React.FC = () => {
  // --- Step 2: Use strong types and add states for loading, errors, and submitting ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initial state for the form, matching the Course interface
  const initialFormState = { course_code: '', course_name: '', faculty: '' };
  const [newCourse, setNewCourse] = useState(initialFormState);

  // --- Step 3: Create a robust data loading function ---
  const loadCourses = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await apiClient.get('/courses');
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while fetching courses.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // --- Step 4: Improve form handling with submission state ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/courses', newCourse);
      setNewCourse(initialFormState); // Reset form
      await loadCourses(); // Refresh data
    } catch (err: any) {
      alert(`Error creating course: ${err.message}`); // Simple error feedback
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Step 5: Improve delete handling ---
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await apiClient.delete('/courses', id);
        await loadCourses(); // Refresh data
      } catch (err: any) {
        alert(`Error deleting course: ${err.message}`);
      }
    }
  };

  // --- Step 6: Create a dynamic render function for the main content ---
  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin mr-2" /> Loading Courses...</div>;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center p-8 text-red-600">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <p>Error loading data:</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (courses.length === 0) {
      return <p className="p-8 text-center text-gray-500">No courses found. Please add one using the form above.</p>;
    }

    return (
      <table className="min-w-full bg-white border mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Code</th>
            <th className="py-2 px-4 border-b text-left">Name</th>
            <th className="py-2 px-4 border-b text-left">Faculty</th>
            <th className="py-2 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b font-mono">{course.course_code}</td>
              <td className="py-2 px-4 border-b">{course.course_name}</td>
              <td className="py-2 px-4 border-b">{course.faculty}</td>
              <td className="py-2 px-4 border-b text-center space-x-4">
                <button className="text-blue-500 hover:underline font-semibold" disabled>EDIT</button>
                <button onClick={() => handleDelete(course.id)} className="text-red-500 hover:underline font-semibold">DELETE</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
      <AdminCard title="Manage University Courses">
        <form onSubmit={handleCreate} className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold text-lg">Add New Course</h3>
          {/* IMPORTANT: The `name` attribute should match your state and backend model */}
          <input name="course_code" value={newCourse.course_code} onChange={e => setNewCourse({...newCourse, course_code: e.target.value})} placeholder="Course Code (e.g., COS301)" required className="w-full p-2 border rounded-md" />
          <input name="course_name" value={newCourse.course_name} onChange={e => setNewCourse({...newCourse, course_name: e.target.value})} placeholder="Course Name (e.g., Software Engineering)" required className="w-full p-2 border rounded-md" />
          <input name="faculty" value={newCourse.faculty} onChange={e => setNewCourse({...newCourse, faculty: e.target.value})} placeholder="Faculty (e.g., Engineering)" required className="w-full p-2 border rounded-md" />
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center disabled:bg-blue-400">
            {isSubmitting && <Loader2 className="animate-spin mr-2" />}
            {isSubmitting ? 'Adding Course...' : 'Add Course'}
          </button>
        </form>
        <div className="mt-6">
          <h3 className="font-semibold text-lg">Existing Courses</h3>
          {renderContent()}
        </div>
      </AdminCard>
    </div>
  );
};

export default CourseManagementPage;