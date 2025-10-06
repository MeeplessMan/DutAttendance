import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService';
import { Venue } from '../types';
import { PlusCircle, Trash2, Edit2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import AdminCard from './AdminCard';
import { useNavigate } from 'react-router-dom';

const AdminVenues: React.FC = () => {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [formData, setFormData] = useState({
        room_num: '',
        campus: '',
        latitude: 0,
        longitude: 0
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Venue>>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadVenues = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getVenues();
            setVenues(data);
        } catch (err) {
            setError('Failed to load venues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVenues();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminAPI.createVenue(formData);
            setFormData({
                room_num: '',
                campus: '',
                latitude: 0,
                longitude: 0
            });
            loadVenues();
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to create venue');
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            await adminAPI.updateVenue(id, editData);
            setEditingId(null);
            setEditData({});
            loadVenues();
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to update venue');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this venue?');
        if (confirmed) {
            try {
                await adminAPI.deleteVenue(id);
                loadVenues();
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to delete venue');
            }
        }
    };

    const startEdit = (venue: Venue) => {
        setEditingId(venue.id);
        setEditData({
            room_num: venue.room_num,
            campus: venue.campus,
            latitude: venue.latitude,
            longitude: venue.longitude
        });
    };

    if (loading) return <div className="p-4">Loading venues...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center space-x-4 mb-6">
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Venues Management</h1>
                </div>

                <AdminCard title="Venues Management">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

                    {/* Create Form */}
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg bg-gray-50">
                        <input type="text" placeholder="Room Number" value={formData.room_num} onChange={(e) => setFormData({ ...formData, room_num: e.target.value })} required className="p-2 border rounded-md" />
                        <input type="text" placeholder="Campus" value={formData.campus} onChange={(e) => setFormData({ ...formData, campus: e.target.value })} required className="p-2 border rounded-md" />
                        <input type="number" step="0.000001" placeholder="Latitude" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })} className="p-2 border rounded-md" />
                        <input type="number" step="0.000001" placeholder="Longitude" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })} className="p-2 border rounded-md" />
                        <button type="submit" className="flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors md:col-span-4">
                            <PlusCircle className="w-5 h-5 mr-1" /> Add Venue
                        </button>
                    </form>

                    {/* Venues List */}
                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Campus</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Coordinates</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {venues.map((venue) => (
                                    <tr key={venue.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                            {editingId === venue.id ? 
                                                <input value={editData.room_num} onChange={e => setEditData({ ...editData, room_num: e.target.value })} className="border p-1 w-20" /> 
                                                : venue.room_num}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {editingId === venue.id ? 
                                                <input value={editData.campus} onChange={e => setEditData({ ...editData, campus: e.target.value })} className="border p-1 w-32" /> 
                                                : venue.campus}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {editingId === venue.id ? (
                                                <div className="flex space-x-2">
                                                    <input type="number" step="0.000001" value={editData.latitude} onChange={e => setEditData({ ...editData, latitude: parseFloat(e.target.value) })} className="border p-1 w-24" placeholder="Lat" />
                                                    <input type="number" step="0.000001" value={editData.longitude} onChange={e => setEditData({ ...editData, longitude: parseFloat(e.target.value) })} className="border p-1 w-24" placeholder="Lng" />
                                                </div>
                                            ) : (
                                                `${venue.latitude || 'N/A'}, ${venue.longitude || 'N/A'}`
                                            )}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm space-x-2">
                                            {editingId === venue.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(venue.id)} className="text-green-600 hover:text-green-800 p-1">
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-red-600 hover:text-red-800 p-1">
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(venue)} className="text-blue-600 hover:text-blue-800 p-1">
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(venue.id)} className="text-red-600 hover:text-red-800 p-1">
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
        </div>
    );
};

export default AdminVenues;