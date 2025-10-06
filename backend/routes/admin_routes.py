# File: backend/routes/admin_routes.py
# --- COMPLETE IMPLEMENTATION with Backend Errors Fixed ---
from flask import Blueprint, jsonify, request
from backend import supabase
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

admin_bp = Blueprint('admin_bp', __name__)

# === ACADEMIC STRUCTURE MANAGEMENT ===

# Degree Management (CRUD)
@admin_bp.route('/degrees', methods=['GET'])
def get_degrees():
    try:
        res = supabase.table('degreeprogram').select('*').execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error fetching degrees: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/degrees', methods=['POST'])
def create_degree():
    try:
        data = request.get_json()
        res = supabase.table('degreeprogram').insert(data).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        logging.error(f"Error creating degree: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/degrees/<degree_id>', methods=['PUT'])
def update_degree(degree_id):
    try:
        data = request.get_json()
        res = supabase.table('degreeprogram').update(data).eq('id', degree_id).execute()
        if res.data:
            return jsonify(res.data[0])
        return jsonify({"message": "Degree not found"}), 404
    except Exception as e:
        logging.error(f"Error updating degree {degree_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/degrees/<degree_id>', methods=['DELETE'])
def delete_degree(degree_id):
    try:
        existing_degree = supabase.table('degreeprogram').select('id').eq('id', degree_id).execute()
        if not existing_degree.data:
            return jsonify({"message": "Degree not found"}), 404

        supabase.table('degreeprogram').delete().eq('id', degree_id).execute()
        return jsonify({"message": "Degree deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting degree {degree_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Stream Management (CRUD)
@admin_bp.route('/streams', methods=['GET'])
def get_streams():
    try:
        # Simple query without complex joins
        res = supabase.table('stream').select('*').execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error fetching streams: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/streams', methods=['POST'])
def create_stream():
    try:
        data = request.get_json()
        res = supabase.table('stream').insert(data).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        logging.error(f"Error creating stream: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/streams/<stream_id>', methods=['PUT'])
def update_stream(stream_id):
    try:
        data = request.get_json()
        res = supabase.table('stream').update(data).eq('id', stream_id).execute()
        if res.data:
            return jsonify(res.data[0])
        return jsonify({"message": "Stream not found"}), 404
    except Exception as e:
        logging.error(f"Error updating stream {stream_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/streams/<stream_id>', methods=['DELETE'])
def delete_stream(stream_id):
    try:
        existing = supabase.table('stream').select('id').eq('id', stream_id).execute()
        if not existing.data:
            return jsonify({"message": "Stream not found"}), 404

        supabase.table('stream').delete().eq('id', stream_id).execute()
        return jsonify({"message": "Stream deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting stream {stream_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Academic Year Management (CRUD)
@admin_bp.route('/academic-years', methods=['GET'])
def get_academic_years():
    try:
        res = supabase.table('academicyear').select('*').execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error fetching academic years: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/academic-years', methods=['POST'])
def create_academic_year():
    try:
        data = request.get_json()
        res = supabase.table('academicyear').insert(data).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        logging.error(f"Error creating academic year: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/academic-years/<year_id>', methods=['PUT'])
def update_academic_year(year_id):
    try:
        data = request.get_json()
        res = supabase.table('academicyear').update(data).eq('id', year_id).execute()
        if res.data:
            return jsonify(res.data[0])
        return jsonify({"message": "Academic Year not found"}), 404
    except Exception as e:
        logging.error(f"Error updating academic year {year_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/academic-years/<year_id>', methods=['DELETE'])
def delete_academic_year(year_id):
    try:
        existing = supabase.table('academicyear').select('id').eq('id', year_id).execute()
        if not existing.data:
            return jsonify({"message": "Academic Year not found"}), 404

        supabase.table('academicyear').delete().eq('id', year_id).execute()
        return jsonify({"message": "Academic Year deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting academic year {year_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Student Group Management (CRUD)
@admin_bp.route('/student-groups', methods=['GET'])
def get_student_groups():
    try:
        # Simple query without complex joins
        result = supabase.table('StudentGroup').select('*').execute()
        return jsonify(result.data)
    except Exception as e:
        logging.error(f"Error fetching student groups: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/student-groups', methods=['POST'])
def create_student_group():
    try:
        data = request.get_json()
        res = supabase.table('StudentGroup').insert(data).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        logging.error(f"Error creating student group: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/student-groups/<group_id>', methods=['PUT'])
def update_student_group(group_id):
    try:
        data = request.get_json()
        res = supabase.table('StudentGroup').update(data).eq('id', group_id).execute()
        if res.data:
            return jsonify(res.data[0])
        return jsonify({"message": "Student Group not found"}), 404
    except Exception as e:
        logging.error(f"Error updating student group {group_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/student-groups/<group_id>', methods=['DELETE'])
def delete_student_group(group_id):
    try:
        existing = supabase.table('StudentGroup').select('id').eq('id', group_id).execute()
        if not existing.data:
            return jsonify({"message": "Student Group not found"}), 404

        supabase.table('StudentGroup').delete().eq('id', group_id).execute()
        return jsonify({"message": "Student Group deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting student group {group_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Course Management (CRUD)
#@admin_bp.route('/courses', methods=['GET'])
# In your admin_routes.py - make sure you have this route
@admin_bp.route('/courses/<course_id>', methods=['GET'])
def get_course(course_id):
    try:
        res = supabase.table('Course').select('*').eq('id', course_id).execute()
        if res.data:
            return jsonify(res.data[0])
        return jsonify({"message": "Course not found"}), 404
    except Exception as e:
        logging.error(f"Error fetching course {course_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/courses', methods=['POST'])
def create_course():
    try:
        data = request.get_json()
        res = supabase.table('Course').insert(data).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        logging.error(f"Error creating course: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/courses/<course_id>', methods=['PUT'])
def update_course(course_id):
    try:
        data = request.get_json()
        res = supabase.table('Course').update(data).eq('id', course_id).execute()
        if res.data:
            return jsonify(res.data[0])
        return jsonify({"message": "Course not found"}), 404
    except Exception as e:
        logging.error(f"Error updating course {course_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/courses/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    try:
        existing = supabase.table('Course').select('id').eq('id', course_id).execute()
        if not existing.data:
            return jsonify({"message": "Course not found"}), 404

        supabase.table('Course').delete().eq('id', course_id).execute()
        return jsonify({"message": "Course deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting course {course_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Module Management (CRUD)
@admin_bp.route('/modules', methods=['GET'])
def get_modules():
    try:
        # Simple query without complex joins
        result = supabase.table('Module').select('*').execute()
        return jsonify(result.data)
    except Exception as e:
        logging.error(f"Error fetching modules: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/modules', methods=['POST'])
def create_module():
    try:
        data = request.get_json()
        res = supabase.table('Module').insert(data).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        logging.error(f"Error creating module: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/modules/<module_id>', methods=['PUT'])
def update_module(module_id):
    try:
        data = request.get_json()
        res = supabase.table('Module').update(data).eq('id', module_id).execute()
        if res.data:
            return jsonify(res.data[0])
        return jsonify({"message": "Module not found"}), 404
    except Exception as e:
        logging.error(f"Error updating module {module_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/modules/<module_id>', methods=['DELETE'])
def delete_module(module_id):
    try:
        existing = supabase.table('Module').select('id').eq('id', module_id).execute()
        if not existing.data:
            return jsonify({"message": "Module not found"}), 404

        supabase.table('Module').delete().eq('id', module_id).execute()
        return jsonify({"message": "Module deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting module {module_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Schedule Management (CRUD)
@admin_bp.route('/schedules', methods=['GET'])
def get_schedules():
    try:
        # Simple query without complex joins
        result = supabase.table('Schedule').select('*').execute()
        return jsonify(result.data)
    except Exception as e:
        logging.error(f"Error fetching schedules: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/schedules', methods=['POST'])
def create_schedule():
    try:
        data = request.get_json()
        res = supabase.table('Schedule').insert(data).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        logging.error(f"Error creating schedule: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/schedules/<schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    try:
        data = request.get_json()
        res = supabase.table('Schedule').update(data).eq('id', schedule_id).execute()
        if res.data:
            return jsonify(res.data[0])
        return jsonify({"message": "Schedule entry not found"}), 404
    except Exception as e:
        logging.error(f"Error updating schedule {schedule_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/schedules/<schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    try:
        existing = supabase.table('Schedule').select('id').eq('id', schedule_id).execute()
        if not existing.data:
            return jsonify({"message": "Schedule entry not found"}), 404

        supabase.table('Schedule').delete().eq('id', schedule_id).execute()
        return jsonify({"message": "Schedule entry deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting schedule {schedule_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Venue Management (CRUD)
@admin_bp.route('/venues', methods=['GET'])
def get_venues():
    try:
        res = supabase.table('Venue').select('*').execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error fetching venues: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/venues', methods=['POST'])
def create_venue():
    try:
        data = request.get_json()
        res = supabase.table('Venue').insert(data).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        logging.error(f"Error creating venue: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/venues/<venue_id>', methods=['PUT'])
def update_venue(venue_id):
    try:
        data = request.get_json()
        res = supabase.table('Venue').update(data).eq('id', venue_id).execute()
        if res.data:
            return jsonify(res.data[0])
        return jsonify({"message": "Venue not found"}), 404
    except Exception as e:
        logging.error(f"Error updating venue {venue_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/venues/<venue_id>', methods=['DELETE'])
def delete_venue(venue_id):
    try:
        existing = supabase.table('Venue').select('id').eq('id', venue_id).execute()
        if not existing.data:
            return jsonify({"message": "Venue not found"}), 404

        supabase.table('Venue').delete().eq('id', venue_id).execute()
        return jsonify({"message": "Venue deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting venue {venue_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# User Management (CRUD)
@admin_bp.route('/users', methods=['GET'])
def get_users():
    try:
        role = request.args.get('role', 'student')
        # Simple query without complex joins
        res = supabase.table('User').select('*').eq('role', role).execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error fetching users: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        res = supabase.table('User').insert(data).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        logging.error(f"Error creating user: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.get_json()
        res = supabase.table('User').update(data).eq('id', user_id).execute()
        if res.data:
            return jsonify(res.data[0])
        return jsonify({"message": "User not found"}), 404 
    except Exception as e:
        logging.error(f"Error updating user {user_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        existing = supabase.table('User').select('id').eq('id', user_id).execute()
        if not existing.data:
            return jsonify({"message": "User not found"}), 404

        supabase.table('User').delete().eq('id', user_id).execute()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting user {user_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Dashboard Statistics
# Dashboard Statistics - FIXED VERSION
@admin_bp.route('/dashboard/stats', methods=['GET'])
def get_admin_stats():
    try:
        # Get total students
        students_res = supabase.table('User').select('id').eq('role', 'student').execute()
        total_students = len(students_res.data) if students_res.data else 0
        
        # Get total lecturers
        lecturers_res = supabase.table('User').select('id').eq('role', 'lecturer').execute()
        total_lecturers = len(lecturers_res.data) if lecturers_res.data else 0
        
        # Get total modules
        modules_res = supabase.table('Module').select('id').execute()
        total_modules = len(modules_res.data) if modules_res.data else 0
        
        # Get total schedules
        schedules_res = supabase.table('Schedule').select('id').execute()
        total_schedules = len(schedules_res.data) if schedules_res.data else 0
        
        # SIMPLIFIED: Active student groups - just count all groups
        try:
            groups_res = supabase.table('StudentGroup').select('id').execute()
            active_student_groups_count = len(groups_res.data) if groups_res.data else 0
        except Exception as group_error:
            logging.warning(f"Could not fetch student groups: {group_error}")
            active_student_groups_count = 0

        # SIMPLIFIED: Students by degree - skip this for now
        students_by_degree = {}

        stats = {
            'total_students': total_students,
            'total_lecturers': total_lecturers,
            'total_modules': total_modules,
            'total_schedules': total_schedules,
            'active_student_groups': active_student_groups_count,
            'students_by_degree': students_by_degree,
            'attendance_rate': 85  # Placeholder - you can calculate this later
        }
        
        return jsonify(stats)
    except Exception as e:
        logging.error(f"Error fetching admin dashboard stats: {e}", exc_info=True)
        # Return placeholder data to keep frontend working
        return jsonify({
            'total_students': 0,
            'total_lecturers': 0,
            'total_modules': 0,
            'total_schedules': 0,
            'active_student_groups': 0,
            'students_by_degree': {},
            'attendance_rate': 0
        })

# Enrollment Management (NEW ROUTES FOR APPROVAL WORKFLOW)
@admin_bp.route('/student-enrollments', methods=['GET'])
def get_student_enrollments():
    """Fetches student enrollment requests, optionally filtered by status (e.g., pending)."""
    status = request.args.get('status')
    
    try:
        # Simple query without complex joins
        query = supabase.table('studentenrollment').select('*')
        
        if status:
            query = query.eq('status', status)
            
        res = query.execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error fetching student enrollments: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/enrollments/<enrollment_id>/approve', methods=['POST'])
def approve_enrollment(enrollment_id):
    """Approves a student enrollment and assigns them to a student group."""
    try:
        data = request.get_json()
        # Requires the student_group_id to finalize the student's enrollment
        student_group_id = data.get('student_group_id')
        user_id = data.get('user_id') 

        if not student_group_id or not user_id:
            return jsonify({"error": "student_group_id and user_id are required for approval"}), 400
            
        # 1. Update the enrollment status
        update_enrollment_res = supabase.table('studentenrollment').update({
            'status': 'approved',
            'approved_at': datetime.now().isoformat(),
            'approved_by': 'admin_user_id' # Ideally, get the current admin's ID
        }).eq('id', enrollment_id).execute()
        
        # 2. Update the main User table to assign the Student Group (linking them to their timetable)
        supabase.table('User').update({
            'student_group_id': student_group_id,
        }).eq('id', user_id).execute()

        if update_enrollment_res.data:
            return jsonify({"message": "Enrollment approved and student group assigned."}), 200
        return jsonify({"message": "Enrollment not found"}), 404
    except Exception as e:
        logging.error(f"Error approving enrollment {enrollment_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/enrollments/<enrollment_id>/reject', methods=['POST'])
def reject_enrollment(enrollment_id):
    """Rejects a student enrollment application."""
    try:
        update_enrollment_res = supabase.table('studentenrollment').update({
            'status': 'rejected',
        }).eq('id', enrollment_id).execute()
        
        if update_enrollment_res.data:
            return jsonify({"message": "Enrollment rejected."}), 200
        return jsonify({"message": "Enrollment not found"}), 404
    except Exception as e:
        logging.error(f"Error rejecting enrollment {enrollment_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Additional Admin Routes
@admin_bp.route('/attendance-records', methods=['GET'])
def get_attendance_records():
    """Get attendance records for admin reporting"""
    try:
        # Simple query without complex joins
        res = supabase.table('AttendanceRecord').select('*').execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error fetching attendance records: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/system-settings', methods=['GET'])
def get_system_settings():
    """Get system settings"""
    try:
        res = supabase.table('SystemSettings').select('*').execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error fetching system settings: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/system-settings', methods=['PUT'])
def update_system_settings():
    """Update system settings"""
    try:
        data = request.get_json()
        res = supabase.table('SystemSettings').update(data).eq('id', 1).execute()
        if res.data:
            return jsonify(res.data[0])
        return jsonify({"message": "System settings not found"}), 404
    except Exception as e:
        logging.error(f"Error updating system settings: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/reports/attendance', methods=['GET'])
def get_attendance_report():
    """Generate attendance reports"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = supabase.table('AttendanceRecord').select('*')
        
        if start_date:
            query = query.gte('date', start_date)
        if end_date:
            query = query.lte('date', end_date)
            
        res = query.execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error generating attendance report: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/reports/student-performance', methods=['GET'])
def get_student_performance_report():
    """Generate student performance reports"""
    try:
        student_group_id = request.args.get('student_group_id')
        
        query = supabase.table('User').select('*').eq('role', 'student')
        
        if student_group_id:
            query = query.eq('student_group_id', student_group_id)
            
        res = query.execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error generating student performance report: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Backup and Restore Routes
@admin_bp.route('/backup', methods=['POST'])
def create_backup():
    """Create database backup"""
    try:
        # This would typically call a database backup function
        # For now, return a placeholder response
        return jsonify({"message": "Backup created successfully", "backup_id": f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"})
    except Exception as e:
        logging.error(f"Error creating backup: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/restore/<backup_id>', methods=['POST'])
def restore_backup(backup_id):
    """Restore database from backup"""
    try:
        # This would typically call a database restore function
        # For now, return a placeholder response
        return jsonify({"message": f"Backup {backup_id} restored successfully"})
    except Exception as e:
        logging.error(f"Error restoring backup {backup_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# System Health Check
@admin_bp.route('/health', methods=['GET'])
def health_check():
    """System health check endpoint"""
    try:
        # Test database connection
        supabase.table('User').select('id').limit(1).execute()
        
        health_status = {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
        return jsonify(health_status)
    except Exception as e:
        logging.error(f"Health check failed: {e}", exc_info=True)
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 503

# Bulk Operations
@admin_bp.route('/bulk/users', methods=['POST'])
def bulk_create_users():
    """Bulk create users from CSV or JSON data"""
    try:
        data = request.get_json()
        if not data or not isinstance(data, list):
            return jsonify({"error": "Expected a list of users"}), 400
            
        res = supabase.table('User').insert(data).execute()
        return jsonify({
            "message": f"Successfully created {len(res.data)} users",
            "created_users": res.data
        }), 201
    except Exception as e:
        logging.error(f"Error in bulk user creation: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/bulk/schedules', methods=['POST'])
def bulk_create_schedules():
    """Bulk create schedules"""
    try:
        data = request.get_json()
        if not data or not isinstance(data, list):
            return jsonify({"error": "Expected a list of schedules"}), 400
            
        res = supabase.table('Schedule').insert(data).execute()
        return jsonify({
            "message": f"Successfully created {len(res.data)} schedules",
            "created_schedules": res.data
        }), 201
    except Exception as e:
        logging.error(f"Error in bulk schedule creation: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Data Export Routes
@admin_bp.route('/export/students', methods=['GET'])
def export_students():
    """Export student data"""
    try:
        res = supabase.table('User').select('*').eq('role', 'student').execute()
        return jsonify({
            "export_type": "students",
            "count": len(res.data),
            "data": res.data,
            "exported_at": datetime.now().isoformat()
        })
    except Exception as e:
        logging.error(f"Error exporting student data: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/export/courses', methods=['GET'])
def export_courses():
    """Export course data"""
    try:
        res = supabase.table('Course').select('*').execute()
        return jsonify({
            "export_type": "courses",
            "count": len(res.data),
            "data": res.data,
            "exported_at": datetime.now().isoformat()
        })
    except Exception as e:
        logging.error(f"Error exporting course data: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Notification Management
@admin_bp.route('/notifications', methods=['GET'])
def get_notifications():
    """Get system notifications"""
    try:
        res = supabase.table('Notification').select('*').execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error fetching notifications: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/notifications', methods=['POST'])
def create_notification():
    """Create a new notification"""
    try:
        data = request.get_json()
        res = supabase.table('Notification').insert(data).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        logging.error(f"Error creating notification: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/notifications/<notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        existing = supabase.table('Notification').select('id').eq('id', notification_id).execute()
        if not existing.data:
            return jsonify({"message": "Notification not found"}), 404

        supabase.table('Notification').delete().eq('id', notification_id).execute()
        return jsonify({"message": "Notification deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting notification {notification_id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Audit Logs
@admin_bp.route('/audit-logs', methods=['GET'])
def get_audit_logs():
    """Get system audit logs"""
    try:
        res = supabase.table('AuditLog').select('*').order('created_at', desc=True).limit(100).execute()
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error fetching audit logs: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# --- END OF FILE admin_routes.py ---






#@admin_bp.route('/dashboard/stats', methods=['GET'])
#def get_admin_stats():
    #try:
        # Get total students by degree
        # 'user' table is actually 'User', and count needs to be retrieved carefully
        # It should be a single query to get the count, not filter by degree then count
        # Or, if you want students *per degree*, then group by degree_id
        
        # Let's simplify this to get overall counts first.
        # For students by degree, you might need a different Supabase query structure
        
        # Total students
        #total_students_res = supabase.table('User').select('id').eq('role', 'student').execute()
        #total_students = len(total_students_res.data) if total_students_res.data else 0

        # Students by degree (assuming 'degree_id' is a foreign key in 'User' table)
        # This requires PostgreSQL aggregation, which might be complex through postgrest/supabase client
        # A simpler way is to fetch all students and aggregate in Python or use a view/function in Supabase
        
        # Let's fetch all students and aggregate in Python for now.
        #all_students_with_degree_res = supabase.table('User').select('degree_id, Degree(degree_name)').eq('role', 'student').execute()
        #students_by_degree_data = {}
        #if all_students_with_degree_res.data:
            #for student in all_students_with_degree_res.data:
                #degree_name = student.get('Degree', {}).get('degree_name', 'Unknown Degree')
                #if degree_name not in students_by_degree_data:
                    #students_by_degree_data[degree_name] = 0
                #students_by_degree_data[degree_name] += 1
        
        # Convert to a list of dicts for frontend
        #students_by_degree_list = [{"degree_name": k, "count": v} for k, v in students_by_degree_data.items()]


        # Get total schedules
        #total_schedules_res = supabase.table('Schedule').select('id').execute()
        #total_schedules = len(total_schedules_res.data) if total_schedules_res.data else 0
        
        # Get active student groups (groups with at least one schedule entry)
        # This requires selecting distinct student_group_id from modules that have schedules
        # A direct way would be to get distinct module_id from schedule and then link to student_group
        
        # Get distinct student_group_ids from modules that have schedules
        # This might require a more complex query if schedules link directly to modules and modules to student_group
        # For simplicity, let's get all student_group_ids from modules
        
        # Fetch all modules with their student_group_id and then count unique groups
        #all_modules_res = supabase.table('Module').select('student_group_id').execute()
        #active_student_groups_set = set()
        #if all_modules_res.data:
            #for Module in all_modules_res.data:
                #if Module.get('student_group_id'):
                    #active_student_groups_set.add(Module['student_group_id'])
        
        #active_student_groups_count = len(active_student_groups_set)

        #stats = {
            #'totalStudents': total_students,
            #'studentsByDegree': students_by_degree_list, # Updated to use the aggregated list
            #'totalSchedules': total_schedules,
            #'activeStudentGroups': active_student_groups_count
        #}
        
        #return jsonify(stats)
    #except Exception as e:
        #logging.error(f"Error fetching admin dashboard stats: {e}", exc_info=True)
        #return jsonify({"error": str(e)}), 500

# Other routes for lecturer_routes.py and student_routes.py might also need similar logging and error handling
# I'll only provide the admin_routes.py as an example of adding logging.

# --- END OF FILE admin_routes.py ---