import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService';
import { DegreeProgram } from '../types';
import { PlusCircle, Trash2, Edit2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import AdminCard from './AdminCard';
import { useNavigate } from 'react-router-dom';

const AdminDegrees: React.FC = () => {
    const [degrees, setDegrees] = useState<DegreeProgram[]>([]);
    const [formData, setFormData] = useState({ name: '', code: '', faculty: '', duration_years: 4 });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<DegreeProgram>>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadDegrees = async () => {
        try {
            setLoading(true);
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminAPI.createDegree(formData);
            setFormData({ name: '', code: '', faculty: '', duration_years: 4 });
            loadDegrees();
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to create degree');
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            await adminAPI.updateDegree(id, editData);
            setEditingId(null);
            setEditData({});
            loadDegrees();
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to update degree');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this degree? This cannot be undone.');
        if (confirmed) {
            try {
                await adminAPI.deleteDegree(id);
                loadDegrees();
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to delete degree');
            }
        }
    };

    const startEdit = (degree: DegreeProgram) => {
        setEditingId(String(degree.id));
        setEditData({
            name: degree.name,
            code: degree.code,
            faculty: degree.faculty,
            duration_years: degree.duration_years
        });
    };

    if (loading) return <div className="p-4">Loading degrees...</div>;

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center space-x-4 mb-6">
                <button 
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Degree Program Management</h1>
            </div>

            <AdminCard title="Degree Program Management (CRUD)">
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

                {/* Create Form */}
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg bg-gray-50">
                    <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="col-span-1 p-2 border rounded-md" />
                    <input type="text" placeholder="Code (e.g., BINT)" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required className="col-span-1 p-2 border rounded-md" />
                    <input type="text" placeholder="Faculty" value={formData.faculty} onChange={(e) => setFormData({ ...formData, faculty: e.target.value })} required className="col-span-1 p-2 border rounded-md" />
                    <input type="number" placeholder="Duration (years)" value={formData.duration_years} onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) })} required className="col-span-1 p-2 border rounded-md" />
                    <button type="submit" className="flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        <PlusCircle className="w-5 h-5 mr-1" /> Add
                    </button>
                </form>

                {/* Degrees List Table */}
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {degrees.map((degree) => (
                                <tr key={String(degree.id)}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                        {editingId === String(degree.id) ? 
                                            <input value={editData.code} onChange={e => setEditData({ ...editData, code: e.target.value })} className="border p-1 w-20" /> 
                                            : degree.code}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                        {editingId === String(degree.id) ? 
                                            <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="border p-1 w-40" /> 
                                            : degree.name}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                        {editingId === String(degree.id) ? 
                                            <input value={editData.faculty} onChange={e => setEditData({ ...editData, faculty: e.target.value })} className="border p-1 w-32" /> 
                                            : degree.faculty}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                        {editingId === String(degree.id) ? 
                                            <input type="number" value={editData.duration_years} onChange={e => setEditData({ ...editData, duration_years: parseInt(e.target.value) })} className="border p-1 w-16" /> 
                                            : `${degree.duration_years} Yrs`}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm space-x-2">
                                        {editingId === String(degree.id) ? (
                                            <>
                                                <button onClick={() => handleUpdate(String(degree.id))} className="text-green-600 hover:text-green-800 p-1">
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="text-red-600 hover:text-red-800 p-1">
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEdit(degree)} className="text-blue-600 hover:text-blue-800 p-1">
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(String(degree.id))} className="text-red-600 hover:text-red-800 p-1">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminCard>
        </div>
    );
};

export default AdminDegrees;