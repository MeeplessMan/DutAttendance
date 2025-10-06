import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/apiService';
import { StudentEnrollment, DegreeProgram, Stream, User } from '../types';
import AdminCard from './AdminCard';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface FullEnrollment extends StudentEnrollment {
    academic_year: any;
    user: User;
    degreeprogram: DegreeProgram;
    stream: Stream;
    // Add AcademicYear and StudentGroup if necessary
}

// NOTE: You must also create a backend route to fetch StudentGroup data
interface StudentGroup {
    id: string;
    group_code: string;
    group_name: string;
}

const AdminEnrollmentApproval: React.FC = () => {
    const [enrollments, setEnrollments] = useState<FullEnrollment[]>([]);
    const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<{ [key: string]: string }>({});
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const loadEnrollmentData = async () => {
        try {
            setLoading(true);
            // NOTE: You need to implement getPendingEnrollments in your backend (admin_routes.py)
            // It should fetch studentenrollment records where status='pending' and join User, Degree, Stream.
            const pendingData: FullEnrollment[] = await adminAPI.getPendingEnrollments() as FullEnrollment[];

            // NOTE: You must also implement a route to get all StudentGroups for assignment
            // For now, mocking groups until the backend route is available
            const groups: StudentGroup[] = [
                { id: '1', group_code: 'IT3A-SE', group_name: 'IT 3rd Year Software Engineering' },
                { id: '2', group_code: 'IT3B-CS', group_name: 'IT 3rd Year Cyber Security' },
                // ... real data from /admin/student-groups
            ];

            setEnrollments(pendingData);
            setStudentGroups(groups);

            // Initialize selected group state
            const initialGroupSelection: { [key: string]: string } = {};
            pendingData.forEach(e => {
                // Pre-select a group for quicker approval (optional)
                const defaultGroup = groups.find(g => g.group_name.includes(e.degreeprogram?.name || '') && g.group_name.includes(e.stream?.name || ''));
                initialGroupSelection[e.user_id] = defaultGroup ? defaultGroup.id : '';
            });
            setSelectedGroup(initialGroupSelection);

        } catch (err: any) {
            setError(err.message || 'Failed to load enrollment requests.');
            console.error('Error loading enrollments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEnrollmentData();
    }, []);

    const handleApprove = async (enrollment: FullEnrollment) => {
        const studentGroupId = selectedGroup[enrollment.user_id];

        if (!studentGroupId) {
            alert("Please select a Student Group before approving.");
            return;
        }

        setIsProcessing(enrollment.user_id);
        try {
            // Update the User record directly with the assigned Student Group ID
            await adminAPI.updateUserEnrollmentStatus(enrollment.user_id, {
                student_group_id: studentGroupId,
                role: 'student' // Ensure role is 'student' or update based on your schema
            });

            // NOTE: Ideally, you'd also update the 'studentenrollment' record status to 'approved'
            // For simplicity, we assume setting the group ID in 'User' is the final approval step.

            alert(`Enrollment for ${enrollment.user?.first_name} approved and assigned to Group ID ${studentGroupId}!`);
            loadEnrollmentData(); // Reload list
        } catch (err: any) {
            setError(err.message || 'Approval failed.');
            console.error('Approval error:', err);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleReject = async (enrollment: FullEnrollment) => {
        const confirmed = window.confirm(`Are you sure you want to reject enrollment for ${enrollment.user?.first_name}?`);
        if (confirmed) {
            // NOTE: You need a PUT route to update studentenrollment status to 'rejected'
            // Or, simply delete the enrollment request
            alert(`Enrollment for ${enrollment.user?.first_name} rejected.`);
            loadEnrollmentData();
        }
    };

    if (loading) return <p className="p-4">Loading pending enrollment requests...</p>;
    if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

    return (
        <AdminCard title={`Pending Student Enrollments (${enrollments.length})`}>
            {enrollments.length === 0 ? (
                <p className="text-gray-500">No new enrollment requests pending review.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requested Program</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assign Group</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {enrollments.map((e) => (
                                <tr key={e.user_id} className="hover:bg-yellow-50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{e.user?.first_name} {e.user?.surname} ({e.user?.student_number})</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{e.degreeprogram?.code} - {e.stream?.code}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{e.academic_year?.year_name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <select
                                            value={selectedGroup[e.user_id] || ''}
                                            onChange={(ev) => setSelectedGroup({ ...selectedGroup, [e.user_id]: ev.target.value })}
                                            className="p-1 border rounded-md text-sm w-40"
                                            disabled={isProcessing === e.user_id}
                                        >
                                            <option value="">-- Select Group --</option>
                                            {studentGroups.map(group => (
                                                <option key={group.id} value={group.id}>{group.group_code}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm space-x-2">
                                        <button
                                            onClick={() => handleApprove(e)}
                                            disabled={isProcessing === e.user_id || !selectedGroup[e.user_id]}
                                            className="text-white bg-green-600 hover:bg-green-700 p-1 rounded transition-colors disabled:opacity-50"
                                        >
                                            {isProcessing === e.user_id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleReject(e)}
                                            disabled={isProcessing === e.user_id}
                                            className="text-white bg-red-600 hover:bg-red-700 p-1 rounded transition-colors disabled:opacity-50"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminCard>
    );
};

export default AdminEnrollmentApproval;