import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService';
import { AcademicYear, DegreeProgram, Stream } from '../types';
import { PlusCircle, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import AdminCard from './AdminCard';
import AdminStudentGroup from './AdminStudentGroup';

// --- Degree Management Component ---

const DegreeManagement: React.FC<{ degrees: DegreeProgram[], loadDegrees: () => void }> = ({ degrees, loadDegrees }) => {
    const [formData, setFormData] = useState({ name: '', code: '', faculty: '', duration_years: 4 });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<DegreeProgram>>({});
    const [error, setError] = useState<string | null>(null);

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

    return (
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
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{editingId === String(degree.id) ? <input value={editData.code} onChange={e => setEditData({ ...editData, code: e.target.value })} className="border p-1 w-20" /> : degree.code}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{editingId === String(degree.id) ? <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="border p-1 w-40" /> : degree.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{editingId === String(degree.id) ? <input value={editData.faculty} onChange={e => setEditData({ ...editData, faculty: e.target.value })} className="border p-1 w-32" /> : degree.faculty}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{editingId === String(degree.id) ? <input type="number" value={editData.duration_years} onChange={e => setEditData({ ...editData, duration_years: parseInt(e.target.value) })} className="border p-1 w-16" /> : `${degree.duration_years} Yrs`}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-center text-sm space-x-2">
                                    {editingId === String(degree.id) ? (
                                        <>
                                            <button onClick={() => handleUpdate(String(degree.id))} className="text-green-600 hover:text-green-800 p-1"><CheckCircle className="w-5 h-5" /></button>
                                            <button onClick={() => setEditingId(null)} className="text-red-600 hover:text-red-800 p-1"><XCircle className="w-5 h-5" /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEdit(degree)} className="text-blue-600 hover:text-blue-800 p-1"><Edit2 className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(String(degree.id))} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="w-5 h-5" /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminCard>
    );
};

// --- Stream Management Component ---

const StreamManagement: React.FC<{ degrees: DegreeProgram[] }> = ({ degrees }) => {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [formData, setFormData] = useState({ name: '', code: '', degree_program_id: '' });
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Stream>>({});

    const loadStreams = async () => {
        try {
            const data = await adminAPI.getStreams();
            setStreams(data);
        } catch (err) {
            console.error('Error loading streams:', err);
        }
    };

    useEffect(() => {
        loadStreams();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Convert string to number for degree_program_id
            await adminAPI.createStream({ 
                ...formData, 
                degree_program_id: parseInt(formData.degree_program_id) 
            });
            setFormData({ name: '', code: '', degree_program_id: '' });
            loadStreams();
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to create stream');
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            await adminAPI.updateStream(id, editData);
            setEditingId(null);
            setEditData({});
            loadStreams();
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to update stream');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this stream?');
        if (confirmed) {
            try {
                await adminAPI.deleteStream(id);
                loadStreams();
            } catch (err: any) {
                setError(err.message || 'Failed to delete stream');
            }
        }
    };

    const startEdit = (stream: Stream) => {
        setEditingId(String(stream.id));
        setEditData({
            name: stream.name,
            code: stream.code,
            degree_program_id: stream.degree_program_id, // Keep as number
        });
    };

    // Utility to get degree name from ID
    const getDegreeName = (stream: any) => stream.degreeprogram?.name || 'N/A';

    return (
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
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{getDegreeName(stream)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{stream.code}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{stream.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-center text-sm space-x-2">
                                    <button onClick={() => startEdit(stream)} className="text-blue-600 hover:text-blue-800 p-1"><Edit2 className="w-5 h-5" /></button>
                                    <button onClick={() => handleDelete(String(stream.id))} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminCard>
    );
};

// --- Main Academic Structure Layout ---

const AdminAcademicStructure: React.FC = () => {
    const [degrees, setDegrees] = useState<DegreeProgram[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDegrees = async () => {
        try {
            const [degreesData, yearsData] = await Promise.all([
                adminAPI.getDegrees(),
                adminAPI.getAcademicYears(),
            ]);

            setDegrees(degreesData);
            setAcademicYears(yearsData);
        } catch (err) {
            console.error('Error loading core structure data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDegrees();
    }, []);

    if (loading) return <div className="p-4">Loading academic data...</div>;

    return (
        <div className="space-y-8">
            <DegreeManagement degrees={degrees} loadDegrees={loadDegrees} />
            <StreamManagement degrees={degrees} />
            <AdminStudentGroup degrees={degrees} academicYears={academicYears} />
        </div>
    );
};

export default AdminAcademicStructure;