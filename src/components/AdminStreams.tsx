import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService';
import { DegreeProgram, Stream } from '../types';
import { PlusCircle, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import AdminCard from './AdminCard';
import { useNavigate } from 'react-router-dom';

const AdminStreams: React.FC = () => {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [degrees, setDegrees] = useState<DegreeProgram[]>([]);
    const [formData, setFormData] = useState({ name: '', code: '', degree_program_id: '' });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadData = async () => {
        try {
            setLoading(true);
            const [streamsData, degreesData] = await Promise.all([
                adminAPI.getStreams(),
                adminAPI.getDegrees(),
            ]);
            setStreams(streamsData);
            setDegrees(degreesData);
        } catch (err) {
            setError('Failed to load streams data');
            console.error('Error loading streams:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminAPI.createStream({ 
                ...formData, 
                degree_program_id: parseInt(formData.degree_program_id) 
            });
            setFormData({ name: '', code: '', degree_program_id: '' });
            loadData();
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to create stream');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this stream?');
        if (confirmed) {
            try {
                await adminAPI.deleteStream(id);
                loadData();
            } catch (err: any) {
                setError(err.message || 'Failed to delete stream');
            }
        }
    };

    if (loading) return <div className="p-4">Loading streams...</div>;

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
                <h1 className="text-2xl font-bold text-gray-900">Stream Management</h1>
            </div>

            <AdminCard title="Stream Management (E.g., Software Engineering, Cyber Security)">
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

                {/* Create Form */}
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg bg-gray-50">
                    <select
                        value={formData.degree_program_id}
                        onChange={(e) => setFormData({ ...formData, degree_program_id: e.target.value })}
                        required
                        className="p-2 border rounded-md"
                    >
                        <option value="">Select Parent Degree</option>
                        {degrees.map(d => <option key={d.id} value={String(d.id)}>{d.name} ({d.code})</option>)}
                    </select>
                    <input type="text" placeholder="Stream Name (e.g., SE)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="p-2 border rounded-md" />
                    <input type="text" placeholder="Stream Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required className="p-2 border rounded-md" />
                    <button type="submit" className="flex items-center justify-center bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        <PlusCircle className="w-5 h-5 mr-1" /> Add Stream
                    </button>
                </form>

                {/* Streams List Table */}
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Degree</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {streams.map((stream: any) => (
                                <tr key={stream.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                        {stream.degreeprogram?.name || 'N/A'}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{stream.code}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{stream.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm space-x-2">
                                        <button onClick={() => {}} className="text-blue-600 hover:text-blue-800 p-1">
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(String(stream.id))} className="text-red-600 hover:text-red-800 p-1">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
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

export default AdminStreams;