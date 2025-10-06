import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService';
import { Module, Course, User, StudentGroup } from '../types';
import { PlusCircle, Trash2, Edit2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import AdminCard from './AdminCard';
import { useNavigate } from 'react-router-dom';

const AdminModules: React.FC = () => {
    const [modules, setModules] = useState<Module[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [lecturers, setLecturers] = useState<User[]>([]);
    const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
    const [formData, setFormData] = useState({
        module_code: '',
        module_name: '',
        course_id: '',
        lecturer_id: '',
        student_group_id: ''
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Module>>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadData = async () => {
        try {
            setLoading(true);
            const [modulesData, coursesData, lecturersData, groupsData] = await Promise.all([
                adminAPI.getModules(),
                adminAPI.getCourses(),
                adminAPI.getUsers('lecturer'),
                adminAPI.getStudentGroups()
            ]);
            setModules(modulesData);
            setCourses(coursesData);
            setLecturers(lecturersData);
            setStudentGroups(groupsData);
        } catch (err) {
            setError('Failed to load data');
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
            await adminAPI.createModule(formData);
            setFormData({
                module_code: '',
                module_name: '',
                course_id: '',
                lecturer_id: '',
                student_group_id: ''
            });
            loadData();
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to create module');
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            await adminAPI.updateModule(id, editData);
            setEditingId(null);
            setEditData({});
            loadData();
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to update module');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this module?');
        if (confirmed) {
            try {
                await adminAPI.deleteModule(id);
                loadData();
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to delete module');
            }
        }
    };

    const startEdit = (module: Module) => {
        setEditingId(module.id);
        setEditData({
            module_code: module.module_code,
            module_name: module.module_name,
            course_id: typeof module.course_id === 'string' ? module.course_id : (module.course_id as any)?.id,
            lecturer_id: typeof module.lecturer_id === 'string' ? module.lecturer_id : (module.lecturer_id as any)?.id,
            student_group_id: typeof module.student_group_id === 'string' ? module.student_group_id : (module.student_group_id as any)?.id
        });
    };

    if (loading) return <div className="p-4">Loading modules...</div>;

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
                    <h1 className="text-2xl font-bold text-gray-900">Course Modules Management</h1>
                </div>

                <AdminCard title="Course Modules Management">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

                    {/* Create Form */}
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50">
                        <input type="text" placeholder="Module Code" value={formData.module_code} onChange={(e) => setFormData({ ...formData, module_code: e.target.value })} required className="p-2 border rounded-md" />
                        <input type="text" placeholder="Module Name" value={formData.module_name} onChange={(e) => setFormData({ ...formData, module_name: e.target.value })} required className="p-2 border rounded-md" />
                        <select value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} required className="p-2 border rounded-md">
                            <option value="">Select Course</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.course_name}</option>
                            ))}
                        </select>
                        <select value={formData.lecturer_id} onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })} required className="p-2 border rounded-md">
                            <option value="">Select Lecturer</option>
                            {lecturers.map(lecturer => (
                                <option key={lecturer.id} value={lecturer.id}>{lecturer.first_name} {lecturer.surname}</option>
                            ))}
                        </select>
                        <select value={formData.student_group_id} onChange={(e) => setFormData({ ...formData, student_group_id: e.target.value })} required className="p-2 border rounded-md">
                            <option value="">Select Student Group</option>
                            {studentGroups.map(group => (
                                <option key={group.id} value={group.id}>{group.group_name}</option>
                            ))}
                        </select>
                        <button type="submit" className="flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            <PlusCircle className="w-5 h-5 mr-1" /> Add Module
                        </button>
                    </form>

                    {/* Modules List */}
                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lecturer</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {modules.map((module) => (
                                    <tr key={module.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                            {editingId === module.id ? 
                                                <input value={editData.module_code} onChange={e => setEditData({ ...editData, module_code: e.target.value })} className="border p-1 w-20" /> 
                                                : module.module_code}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {editingId === module.id ? 
                                                <input value={editData.module_name} onChange={e => setEditData({ ...editData, module_name: e.target.value })} className="border p-1 w-40" /> 
                                                : module.module_name}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {typeof module.course_id === 'object' ? (module.course_id as any)?.course_name : 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                            {typeof module.lecturer_id === 'object' ? `${(module.lecturer_id as any)?.first_name} ${(module.lecturer_id as any)?.surname}` : 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm space-x-2">
                                            {editingId === module.id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(module.id)} className="text-green-600 hover:text-green-800 p-1">
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-red-600 hover:text-red-800 p-1">
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(module)} className="text-blue-600 hover:text-blue-800 p-1">
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(module.id)} className="text-red-600 hover:text-red-800 p-1">
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

export default AdminModules;