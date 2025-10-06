import { supabase } from '../lib/supabase';
import { DegreeProgram, Stream, StudentEnrollment } from '../types';

export const degreeService = {
    // Degree Management - BULLETPROOF
    async getDegrees(): Promise<DegreeProgram[]> {
        const { data, error } = await supabase
            .from('degreeprogram')
            .select('*')
            .order('name');

        if (error) throw error;
        return (data as any) || [];
    },

    async createDegree(degree: any): Promise<DegreeProgram> {
        const { data, error } = await (supabase as any)
            .from('degreeprogram')
            .insert([degree])
            .select()
            .single();

        if (error) throw error;
        return data as DegreeProgram;
    },

    // Stream Management - BULLETPROOF
    async getStreams(degreeProgramId?: number): Promise<Stream[]> {
        let query = (supabase as any).from('stream').select('*');

        if (degreeProgramId) {
            query = query.eq('degree_program_id', degreeProgramId);
        }

        const { data, error } = await query.order('name');
        if (error) throw error;
        return (data as any) || [];
    },

    async createStream(stream: any): Promise<Stream> {
        const { data, error } = await (supabase as any)
            .from('stream')
            .insert([stream])
            .select()
            .single();

        if (error) throw error;
        return data as Stream;
    },

    // Enrollment Management - BULLETPROOF
    async applyForEnrollment(enrollmentData: any): Promise<StudentEnrollment> {
        const { data, error } = await (supabase as any)
            .from('studentenrollment')
            .insert([{ ...enrollmentData, status: 'pending' }])
            .select()
            .single();

        if (error) throw error;
        return data as StudentEnrollment;
    },

    async getStudentEnrollment(userId: string): Promise<StudentEnrollment | null> {
        const { data, error } = await (supabase as any)
            .from('studentenrollment')
            .select(`
        *,
        DegreeProgram:degree_program_id (name, code),
        Stream:stream_id (name, code),
        AcademicYear:academic_year_id (year_name, year_number)
      `)
            .eq('user_id', userId)
            .eq('status', 'approved')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as StudentEnrollment | null;
    },

    // Timetable Management - BULLETPROOF
    async getTimetable(degreeProgramId: number, streamId: number, academicYearId: number): Promise<any[]> {
        const { data, error } = await (supabase as any)
            .from('timetableentry')
            .select(`
      *,
      Module:module_id (moduleCode, courseName),
      Schedule:schedule_id (weekDay, startTime, endTime, Venue:venue_id (roomNum, campus, latitude, longitude))
    `)
            .eq('degree_program_id', degreeProgramId)
            .eq('stream_id', streamId)
            .eq('academic_year_id', academicYearId)
            .gte('effective_to', new Date().toISOString())
            .order('startTime');

        if (error) throw error;
        return data || [];
    },

    // UPDATE Operations - FIXED
    async updateDegree(id: number, updates: Partial<DegreeProgram>): Promise<DegreeProgram> {
        const { data, error } = await (supabase as any)
            .from('degreeprogram')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateStream(id: number, updates: Partial<Stream>): Promise<Stream> {
        const { data, error } = await (supabase as any)
            .from('stream')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // DELETE Operations - FIXED
    async deleteDegree(id: number): Promise<void> {
        const { error } = await (supabase as any)
            .from('degreeprogram')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async deleteStream(id: number): Promise<void> {
        const { error } = await (supabase as any)
            .from('stream')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Enrollment Approval - FIXED
    async getPendingEnrollments(): Promise<StudentEnrollment[]> {
        const { data, error } = await (supabase as any)
            .from('studentenrollment')
            .select(`
      *,
      User:user_id (first_name, surname, email, student_num),
      DegreeProgram:degree_program_id (name),
      Stream:stream_id (name),
      AcademicYear:academic_year_id (year_name)
    `)
            .eq('status', 'pending');
        if (error) throw error;
        return data || [];
    },

    async approveEnrollment(enrollmentId: number): Promise<void> {
        const { error } = await (supabase as any)
            .from('studentenrollment')
            .update({ 
                status: 'approved', 
                approved_at: new Date().toISOString() 
            })
            .eq('id', enrollmentId);
        if (error) throw error;
    },

    async rejectEnrollment(enrollmentId: number): Promise<void> {
        const { error } = await (supabase as any)
            .from('studentenrollment')
            .update({ 
                status: 'rejected',
                approved_at: new Date().toISOString() 
            })
            .eq('id', enrollmentId);
        if (error) throw error;
    },

    // Timetable CRUD Operations - FIXED
    async createTimetableEntry(entryData: any): Promise<any> {
        const { data, error } = await (supabase as any)
            .from('timetableentry')
            .insert([entryData])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateTimetableEntry(id: number, updates: any): Promise<any> {
        const { data, error } = await (supabase as any)
            .from('timetableentry')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteTimetableEntry(id: number): Promise<void> {
        const { error } = await (supabase as any)
            .from('timetableentry')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Bulk enroll existing students - BULLETPROOF
    async bulkEnrollExistingStudents(defaultDegreeId: number, defaultStreamId: number, defaultYearId: number): Promise<void> {
        const { data: users, error: usersError } = await (supabase as any)
            .from('user')
            .select('id')
            .eq('role', 'student');

        if (usersError) throw usersError;

        const enrollments = (users || []).map((user: any) => ({
            user_id: user.id,
            degree_program_id: defaultDegreeId,
            stream_id: defaultStreamId,
            academic_year_id: defaultYearId,
            status: 'approved'
        }));

        if (enrollments.length > 0) {
            const { error: enrollError } = await (supabase as any)
                .from('studentenrollment')
                .insert(enrollments);

            if (enrollError) throw enrollError;
        }
    }
};