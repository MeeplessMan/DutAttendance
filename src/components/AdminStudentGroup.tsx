import React, { useState, useEffect } from 'react';
import AdminCard from './AdminCard';
import { adminAPI } from '../services/apiService';
import { PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { DegreeProgram, Stream, AcademicYear, StudentGroup } from '../types';
import Modal from './Modal';

interface AdminStudentGroupProps {
    degrees: DegreeProgram[];
    academicYears: AcademicYear[];
}

const AdminStudentGroup: React.FC<AdminStudentGroupProps> = ({ degrees, academicYears }) => {
    const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
    const [formData, setFormData] = useState({
        group_code: '',
        group_name: '',
        degree_id: '',
        stream_id: '',
        academic_year_id: '',
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [groupsData, streamsData] = await Promise.all([
                adminAPI.getStudentGroups(),
                adminAPI.getStreams(),
            ]);
            setStudentGroups(groupsData);
            setStreams(streamsData);
        } catch (err) {
            setError('Failed to load student groups or streams.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (group: StudentGroup) => {
        setEditingGroup(group);
        setFormData({
            group_code: group.group_code,
            group_name: group.group_name,
            degree_id: typeof group.degree_id === 'string' ? group.degree_id : (group.degree_id as any)?.id?.toString() || '',
            stream_id: typeof group.stream_id === 'string' ? group.stream_id : (group.stream_id as any)?.id?.toString() || '',
            academic_year_id: typeof group.academic_year_id === 'string' ? group.academic_year_id : (group.academic_year_id as any)?.id?.toString() || '',
        });
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingGroup(null);
        setFormData({
            group_code: '',
            group_name: '',
            degree_id: '',
            stream_id: '',
            academic_year_id: '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingGroup) {
                await adminAPI.updateStudentGroup(editingGroup.id, formData);
            } else {
                await adminAPI.createStudentGroup(formData);
            }
            setIsModalOpen(false);
            setEditingGroup(null);
            loadData();
        } catch (err) {
            setError(`Failed to ${editingGroup ? 'update' : 'create'} student group.`);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this student group? This will affect associated students and schedules.')) {
            try {
                await adminAPI.deleteStudentGroup(id);
                loadData();
            } catch (err) {
                setError('Failed to delete student group.');
            }
        }
    };

    // Filter streams based on selected degree
    const filteredStreams = streams.filter(stream => String(stream.degree_program_id) === formData.degree_id);

    if (loading) return <div className="p-4">Loading Student Group data...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <AdminCard title="Student Group Management (Timetable Segmentation)">
            <button onClick={handleNew} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <PlusCircle className="w-5 h-5 mr-1" /> Add New Group
            </button>

            <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {studentGroups.map((group) => (
                            <tr key={group.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.group_code}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{group.group_name}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {typeof group.degree_id === 'object' ? (group.degree_id as any)?.name : ''} 
                                    ({typeof group.stream_id === 'object' ? (group.stream_id as any)?.code : ''})
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {typeof group.academic_year_id === 'object' ? (group.academic_year_id as any)?.year_name : ''}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm space-x-2">
                                    <button onClick={() => handleEdit(group)} className="text-blue-600 hover:text-blue-900">
                                        <Edit2 className="w-4 h-4 inline" />
                                    </button>
                                    <button onClick={() => handleDelete(group.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 className="w-4 h-4 inline" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for Create/Edit */}
            <Modal title={editingGroup ? 'Edit Student Group' : 'Add New Student Group'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Group Code</label>
                            <input type="text" name="group_code" value={formData.group_code} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Group Name</label>
                            <input type="text" name="group_name" value={formData.group_name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Degree Program</label>
                        <select name="degree_id" value={formData.degree_id} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value="">Select Degree</option>
                            {degrees.map(degree => (
                                <option key={degree.id} value={String(degree.id)}>{degree.name} ({degree.code})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stream</label>
                        <select name="stream_id" value={formData.stream_id} onChange={handleChange} required disabled={!formData.degree_id} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100">
                            <option value="">Select Stream</option>
                            {filteredStreams.map(stream => (
                                <option key={stream.id} value={String(stream.id)}>{stream.name} ({stream.code})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                        <select name="academic_year_id" value={formData.academic_year_id} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value="">Select Academic Year</option>
                            {academicYears.map(year => (
                                <option key={year.id} value={String(year.id)}>{year.year_name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                        {editingGroup ? 'Update Group' : 'Create Group'}
                    </button>
                </form>
            </Modal>
        </AdminCard>
    );
};

export default AdminStudentGroup;