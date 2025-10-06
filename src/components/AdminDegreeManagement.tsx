// File: frontend/src/components/AdminDegreeManagement.tsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService';

interface Degree {
  id: number;
  name: string;
  code: string;
  faculty: string;
  duration_years: number;
}

const AdminDegreeManagement: React.FC = () => {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    faculty: '',
    duration_years: 4
  });

  const loadDegrees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getDegrees();
      setDegrees(data);
    } catch (err) {
      setError('Failed to load degrees');
      console.error('Error loading degrees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDegrees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createDegree(formData);
      setFormData({ name: '', code: '', faculty: '', duration_years: 4 });
      loadDegrees();
    } catch (err) {
      setError('Failed to create degree');
      console.error('Error creating degree:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this degree?')) {
      try {
        await adminAPI.deleteDegree(id);
        loadDegrees();
      } catch (err) {
        setError('Failed to delete degree');
        console.error('Error deleting degree:', err);
      }
    }
  };

  if (loading) return <div className="p-4">Loading degrees...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Degree Management</h2>
        
        {/* Create Degree Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Degree</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Degree Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Degree Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Faculty"
              value={formData.faculty}
              onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Duration (years)"
                value={formData.duration_years}
                onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Degree
              </button>
            </div>
          </form>
        </div>

        {/* Degrees List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Existing Degrees</h3>
          {degrees.length === 0 ? (
            <p className="text-gray-500">No degrees found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {degrees.map((degree) => (
                    <tr key={degree.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{degree.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{degree.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{degree.faculty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{degree.duration_years} years</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => handleDelete(degree.id.toString())}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDegreeManagement;