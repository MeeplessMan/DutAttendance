import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService';
import { AcademicYear } from '../types';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import AdminCard from './AdminCard';
import { useNavigate } from 'react-router-dom';

const AdminAcademicYears: React.FC = () => {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [formData, setFormData] = useState({ year_name: '', start_date: '', end_date: '' });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadAcademicYears = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getAcademicYears();
            setAcademicYears(data);
        } catch (err) {
            setError('Failed to load academic years');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAcademicYears(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminAPI.createAcademicYear(formData);
            setFormData({ year_name: '', start_date: '', end_date: '' });
            loadAcademicYears();
            setError(null);
        } catch (err: any) { setError(err.message || 'Failed to create academic year'); }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this academic year?')) {
            try {
                await adminAPI.deleteAcademicYear(id);
                loadAcademicYears();
            } catch (err: any) { setError(err.message || 'Failed to delete academic year'); }
        }
    };

    // Safe date formatting function - handles all possible types
    const formatDate = (dateValue: string | number | Date | undefined): string => {
        if (!dateValue) return 'N/A';
        
        try {
            // Convert to Date object regardless of input type
            const date = new Date(dateValue);
            
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            
            return date.toLocaleDateString();
        } catch {
            return 'Invalid Date';
        }
    };
    
    if (loading) return <div className="p-6">Loading academic years...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <button onClick={() => navigate('/admin/dashboard')} className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Dashboard
                    </button>
                </div>

                <AdminCard title="Academic Year Management">
                     {error && <div className="p-4 m-6 mb-0 text-red-700 bg-red-100 rounded-lg">{error}</div>}

                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-slate-200">
                        <input type="text" placeholder="Year Name (e.g., 2025)" value={formData.year_name} onChange={(e) => setFormData({ ...formData, year_name: e.target.value })} required className="p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        <div className="relative">
                           <label className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">Start Date</label>
                           <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required className="p-2 border border-slate-300 rounded-md shadow-sm w-full" />
                        </div>
                        <div className="relative">
                           <label className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">End Date</label>
                           <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required className="p-2 border border-slate-300 rounded-md shadow-sm w-full" />
                        </div>
                        <button type="submit" className="flex items-center justify-center bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-sm">
                            <PlusCircle className="w-5 h-5 mr-2" /> Add Year
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 hidden md:table-header-group">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Year Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">End Date</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200 grid grid-cols-1 md:table-row-group">
                                {academicYears.map((year) => (
                                    <tr key={year.id} className="grid grid-cols-2 p-4 gap-y-2 md:table-row">
                                        <td data-label="Year" className="col-span-2 md:col-span-1 md:px-6 md:py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{year.year_name}</td>
                                        <td data-label="Starts" className="md:px-6 md:py-4 whitespace-nowrap text-sm text-slate-600">
                                            {formatDate(year.start_date)}
                                        </td>
                                        <td data-label="Ends" className="md:px-6 md:py-4 whitespace-nowrap text-sm text-slate-600">
                                            {formatDate(year.end_date)}
                                        </td>
                                        <td data-label="Actions" className="col-span-2 md:col-span-1 md:px-6 md:py-4 whitespace-nowrap text-center">
                                            <button onClick={() => handleDelete(String(year.id))} className="p-1 text-slate-500 hover:text-red-600">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Responsive table styles */}
                        <style>{`
                            @media (max-width: 768px) {
                                table { display: block; }
                                thead { display: none; }
                                tbody, tr, td { display: block; }
                                td[data-label]::before {
                                    content: attr(data-label) ": ";
                                    font-weight: 600;
                                    color: #475569;
                                }
                            }
                        `}</style>
                    </div>
                </AdminCard>
            </div>
        </div>
    );
};

export default AdminAcademicYears;