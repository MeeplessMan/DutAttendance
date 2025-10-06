// File: src/components/StudentsPage.tsx

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

const StudentsPage: React.FC = () => {
  // State to hold the form data
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    surname: '',
    student_num: '',
    faculty: '',
    role: 'student',
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setMessage('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setMessage(result.message);

      if (response.ok) {
        // Clear the form on success
        setFormData({ email: '', first_name: '', surname: '', student_num: '', faculty: '', role: 'student' });
      }
    } catch (error) {
      setMessage('Failed to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
        <p className="text-gray-600">Onboard new students, lecturers, and admins to the system.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Add New User
          </h3>
          
          {/* Form fields for user details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" required className="p-2 border rounded-md" />
            <input name="surname" value={formData.surname} onChange={handleChange} placeholder="Surname" required className="p-2 border rounded-md" />
            <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email Address" required className="p-2 border rounded-md" />
            <input name="student_num" value={formData.student_num} onChange={handleChange} placeholder="Student/Staff Number" required className="p-2 border rounded-md" />
            <input name="faculty" value={formData.faculty} onChange={handleChange} placeholder="Faculty" required className="p-2 border rounded-md" />
            <select name="role" value={formData.role} onChange={handleChange} className="p-2 border rounded-md">
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Creating User...' : 'Create User and Send Invite'}
          </button>

          {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
        </form>
      </div>
    </div>
  );
};


export default StudentsPage;