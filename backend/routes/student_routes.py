# File: backend/routes/student_routes.py
"""
Student Routes Blueprint - PRODUCTION READY VERSION
"""

from flask import Blueprint, jsonify, logging, request
import numpy as np
import base64
import io
import math
import datetime
from PIL import Image
from datetime import datetime

from backend import supabase, detector, sp, facerec, load_known_faces, known_encodings, known_names

student_bp = Blueprint('student_bp', __name__)

# --- UTILITY FUNCTIONS ---

def _base64_to_image(base64_string: str) -> np.ndarray:
    """Converts a base64 string to a NumPy array image."""
    try:
        if 'data:image' in base64_string:
            base64_string = base64_string.split(',')[1]
        img_data = base64.b64decode(base64_string)
        return np.array(Image.open(io.BytesIO(img_data)).convert("RGB"))
    except Exception as e:
        raise ValueError(f"Invalid image data: {str(e)}")

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two geographical points using Haversine formula."""
    R = 6371e3  # Radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2) ** 2 + 
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

# --- STUDENT API ROUTES ---

@student_bp.route('/profile', methods=['GET'])
def get_student_profile():
    """Get comprehensive student profile information."""
    try:
        student_id = request.args.get('studentId')
        if not student_id:
            return jsonify({'error': 'Student ID is required'}), 400
        
        # Get user data with student group information
        response = supabase.table('User').select('''
            id, firstName, surname, email, studentNum, role, faculty,
            studentGroupId,
            StudentGroup (id, groupCode, groupName, courseCode)
        ''').eq('id', student_id).execute()
        
        if not response.data:
            return jsonify({'error': 'Student not found'}), 404
        
        student_data = response.data[0]
        student_group = student_data.get('StudentGroup', {})
        
        profile_data = {
            'id': student_data['id'],
            'first_name': student_data['firstName'],
            'surname': student_data['surname'],
            'email': student_data['email'],
            'student_number': student_data['studentNum'],
            'faculty': student_data.get('faculty', ''),
            'role': student_data['role'],
            'student_group_id': student_data.get('studentGroupId'),
            'student_group': {
                'id': student_group.get('id'),
                'group_code': student_group.get('groupCode'),
                'group_name': student_group.get('groupName'),
                'course_code': student_group.get('courseCode')
            } if student_group else None
        }
        
        return jsonify(profile_data)
        
    except Exception as e:
        print(f"Error fetching student profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# File: backend/routes/student_routes.py
@student_bp.route('/timetable', methods=['GET'])
def get_student_timetable():
    """Get complete timetable for a student based on their student group."""
    student_id = request.args.get('studentId')
    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400
    
    try:
        # Get all schedules - simplified approach
        timetable_res = supabase.table('Schedule').select('''
            *,
            Module (
                moduleCode,
                courseCode,
                User (
                    firstName, 
                    surname
                )
            ),
            Venue (
                roomNum,
                campus,
                latitude,
                longitude
            )
        ''').execute()

        return jsonify(timetable_res.data or [])

    except Exception as e:
        logging.error(f"Error in get_student_timetable: {e}", exc_info=True)
        return jsonify({"error": "Internal server error fetching timetable"}), 500

@student_bp.route('/current-class', methods=['GET'])
def get_current_class():
    """Get the class currently in session for the student."""
    student_id = request.args.get('studentId')
    if not student_id:
        return jsonify({"error": "studentId is required"}), 400
        
    try:
        # Get current day and time
        now = datetime.now()
        current_day = now.isoweekday()  # Monday=1, Sunday=7
        current_time_str = now.strftime('%H:%M:%S')

        # Find current class - Use correct camelCase column names
        current_class_res = supabase.table('Schedule').select('''
            *,
            Module (
                moduleCode,
                courseCode,
                User (
                    firstName, 
                    surname
                )
            ),
            Venue (
                roomNum,
                campus,
                latitude,
                longitude
            )
        ''').eq('weekDay', current_day).lte('startTime', current_time_str).gte('endTime', current_time_str).execute()

        return jsonify(current_class_res.data[0] if current_class_res.data else {})

    except Exception as e:
        logging.error(f"Error getting current class: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
    
@student_bp.route('/attendance', methods=['GET'])
def get_student_attendance():
    """Get attendance records for logged-in student"""
    student_id = request.args.get('studentId')
    if not student_id:
        return jsonify({"error": "studentId is required"}), 400
    
    try:
        # Your schema links Attendance -> Event -> Schedule -> Module
        # This query correctly follows that path.
        res = supabase.table('Attendance').select('''
            *,
            Event (
                date,
                Schedule (
                    Module ( module_code, module_name ),
                    Venue ( room_num, campus )
                )
            )
        ''').eq('student_id', student_id).order('timestamp', desc=True).limit(20).execute()
        
        return jsonify(res.data)
    except Exception as e:
        logging.error(f"Error fetching student attendance: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@student_bp.route('/dashboard', methods=['GET'])
def get_student_dashboard():
    """Get comprehensive dashboard data for student."""
    try:
        student_id = request.args.get('studentId')
        if not student_id:
            return jsonify({"error": "Student ID is required"}), 400
        
        # Get student profile
        profile_res = supabase.table('User').select('''
            id, first_name, surname, email, student_num, role, faculty,
            student_group_id,
            StudentGroup (
                id, group_code, group_name, course_code
            )
        ''').eq('id', student_id).execute()
        
        if not profile_res.data:
            return jsonify({"error": "Student not found"}), 404
        
        profile = profile_res.data[0]
        
        # Get today's classes - PRODUCTION FIX: Get all schedules
        now = datetime.now()
        current_day = now.isoweekday()
        
        today_classes = []
        try:
            timetable_res = supabase.table('Schedule').select('''
                *,
                Module (
                    module_code,
                    module_name,
                    User (
                        first_name, 
                        surname
                    )
                ),
                Venue (
                    room_num, 
                    campus
                )
            ''').eq('day_of_week', current_day).order('start_time').execute()
            today_classes = timetable_res.data or []
        except Exception as e:
            print(f"Warning: Could not load today's classes: {str(e)}")
            today_classes = []
        
        # Get recent attendance
        attendance_res = supabase.table('Attendance').select('''
            id,
            event_id,
            student_id,
            attendance_status,
            timestamp,
            confidence_score,
            location_distance
        ''').eq('student_id', student_id).order('timestamp', desc=True).limit(5).execute()
        
        # Calculate attendance statistics
        all_attendance = supabase.table('Attendance').select('attendance_status').eq('student_id', student_id).execute()
        attendance_data = all_attendance.data or []
        
        total_classes = len(attendance_data)
        present_count = len([a for a in attendance_data if a.get('attendance_status') == 'present'])
        attendance_rate = round((present_count / total_classes * 100), 1) if total_classes > 0 else 0
        
        dashboard_data = {
            "profile": {
                "id": profile['id'],
                "first_name": profile['first_name'],
                "surname": profile['surname'],
                "email": profile['email'],
                "student_number": profile['student_num'],
                "faculty": profile.get('faculty', ''),
                "role": profile['role'],
                "student_group": profile.get('StudentGroup')
            },
            "todayClasses": today_classes,
            "recentAttendance": attendance_res.data or [],
            "stats": {
                "totalClasses": total_classes,
                "attendanceRate": attendance_rate,
                "presentCount": present_count,
                "todayClassCount": len(today_classes)
            }
        }
        
        return jsonify(dashboard_data)
        
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return jsonify({"error": "Failed to load dashboard data"}), 500

# Keep your existing enroll and verify routes as they are working fine
@student_bp.route('/enroll', methods=['POST'])
def enroll_student_face():
    """Endpoint for students to enroll their facial embedding."""
    try:
        data = request.get_json()
        student_id_uuid = data.get('student_id')
        images = data.get('images', [])

        if not student_id_uuid or len(images) < 3:
            return jsonify({"success": False, "message": "User ID and 3 images are required."}), 400

        embeddings = []
        for image_data in images:
            img_array = _base64_to_image(image_data)
            dets = detector(img_array, 1)
            if len(dets) != 1:
                return jsonify({"success": False, "message": "Each photo must contain exactly one face for enrollment."}), 400
            
            shape = sp(img_array, dets[0])
            face_descriptor = facerec.compute_face_descriptor(img_array, shape)
            embeddings.append(np.array(face_descriptor))

        # Calculate average embedding for robustness
        average_embedding = np.mean(embeddings, axis=0)
        embedding_list = average_embedding.tolist()

        update_response = supabase.table('User').update({
            'face_embedding': embedding_list
        }).eq('id', student_id_uuid).execute()

        if update_response.data:
            load_known_faces()
            return jsonify({"success": True, "message": "Face enrollment successful! You can now clock in."})
        else:
            raise Exception("Failed to update user record.")

    except Exception as e:
        print(f"ERROR during enrollment: {e}")
        return jsonify({"success": False, "message": "An internal server error occurred during face processing."}), 500
############################################################




@student_bp.route('/debug-schema', methods=['GET'])
def debug_schema():
    """Debug endpoint to check actual column names"""
    try:
        # Check Schedule table
        schedule_sample = supabase.table('Schedule').select('*').limit(1).execute()
        
        # Check Module table
        module_sample = supabase.table('Module').select('*').limit(1).execute()
        
        # Check User table
        user_sample = supabase.table('User').select('*').eq('id', '425d22d3-eb05-41e0-b9c3-fd12c5db8e96').execute()
        
        return jsonify({
            "schedule_columns": list(schedule_sample.data[0].keys()) if schedule_sample.data else [],
            "module_columns": list(module_sample.data[0].keys()) if module_sample.data else [],
            "user_data": user_sample.data[0] if user_sample.data else {}
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500






@student_bp.route('/test-timetable', methods=['GET'])
def test_timetable():
    """Simple test endpoint to check timetable data"""
    try:
        # Get a few schedule entries to test with CORRECT column names
        test_res = supabase.table('Schedule').select('''
            *,
            Module (
                moduleCode,
                courseCode
            ),
            Venue (
                roomNum,
                campus
            )
        ''').limit(3).execute()
        
        return jsonify({
            "success": True,
            "data": test_res.data or [],
            "count": len(test_res.data) if test_res.data else 0
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
    
@student_bp.route('/debug-all-columns', methods=['GET'])
def debug_all_columns():
    """Debug endpoint to check ALL table column names"""
    try:
        # Check all relevant tables
        venue_sample = supabase.table('Venue').select('*').limit(1).execute()
        module_sample = supabase.table('Module').select('*').limit(1).execute()
        user_sample = supabase.table('User').select('*').limit(1).execute()
        
        return jsonify({
            "venue_columns": list(venue_sample.data[0].keys()) if venue_sample.data else [],
            "module_columns": list(module_sample.data[0].keys()) if module_sample.data else [],
            "user_columns": list(user_sample.data[0].keys()) if user_sample.data else [],
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

############################################################
@student_bp.route('/verify', methods=['POST'])
def verify_face():
    """Real-time facial and location verification for attendance."""
    try:
        data = request.get_json()
        image_data = data.get('image_data')
        schedule_id = data.get('schedule_id')
        user_location = data.get('location')
        student_id = data.get('student_id')

        if not student_id:
            return jsonify({"success": False, "message": "Student ID is required."}), 400

        # Face Recognition
        unknown_image = _base64_to_image(image_data)
        dets = detector(unknown_image, 1)
        if not dets:
            return jsonify({"success": False, "message": "No face was detected. Please ensure your face is visible."})

        shape = sp(unknown_image, dets[0])
        unknown_descriptor = np.array(facerec.compute_face_descriptor(unknown_image, shape))
        
        # Compare with known faces
        if known_encodings:
            distances = np.linalg.norm(np.array(known_encodings) - unknown_descriptor, axis=1)
            best_match_index = np.argmin(distances)
            
            if distances[best_match_index] >= 0.6:
                return jsonify({"success": False, "message": "Verification failed. Face does not match registered profile."})

            recognized_name = known_names[best_match_index]
        else:
            user_res = supabase.table('User').select('first_name').eq('id', student_id).execute()
            if not user_res.data:
                return jsonify({"success": False, "message": "Student not found in database."})
            recognized_name = user_res.data[0]['first_name']

        # Location Verification
        schedule_res = supabase.table("Schedule").select("*, Venue(*)").eq("id", schedule_id).execute()
        if not schedule_res.data:
            return jsonify({"success": False, "message": "Could not find scheduled class details."})
            
        venue = schedule_res.data[0].get("Venue")
        if not venue or venue.get('latitude') is None or venue.get('longitude') is None:
            return jsonify({"success": False, "message": "Venue details are incomplete. Cannot verify location."})
        
        distance = calculate_distance(
            user_location['latitude'], 
            user_location['longitude'], 
            venue['latitude'], 
            venue['longitude']
        )
        
        # 100-meter geofence radius
        if distance > 100:
            return jsonify({
                "success": False, 
                "message": f"Verification failed. You are {int(distance)} meters away from the venue. Must be within 100m.",
                "location": {"distance": distance, "withinRange": False}
            })

        # Attendance Recording
        current_date = datetime.now().date().isoformat()
        ACADEMIC_YEAR_ID = 1
        
        # Check for existing Event or create new one
        event_res = supabase.table('Event').select('id').eq('schedule_id', schedule_id).eq('date', current_date).execute()
        
        event_id = None
        if event_res.data:
            event_id = event_res.data[0]['id']
        else:
            new_event_res = supabase.table('Event').insert({
                'schedule_id': schedule_id,
                'date': current_date,
                'academic_year_id': ACADEMIC_YEAR_ID
            }).execute()
            if not new_event_res.data:
                raise Exception("Failed to create new Event record.")
            event_id = new_event_res.data[0]['id']
        
        # Check if attendance already exists
        existing_attendance = supabase.table('Attendance').select('id').eq('event_id', event_id).eq('student_id', student_id).execute()

        if existing_attendance.data:
            return jsonify({
                "success": True,
                "message": f"Welcome, {recognized_name}! Attendance already recorded for this class."
            })
            
        # Record new attendance
        attendance_data = {
            'event_id': event_id,
            'student_id': student_id,
            'attendance_status': 'present',
            'timestamp': datetime.now().isoformat(),
            'confidence_score': 0.95,
            'location_distance': distance
        }
        supabase.table('Attendance').insert(attendance_data).execute()

        return jsonify({
            "success": True,
            "message": f"Verification successful. Attendance recorded for {recognized_name}."
        })

    except Exception as e:
        print(f"INTERNAL SERVER ERROR in /verify: {e}")
        return jsonify({"success": False, "message": "An unexpected server error occurred during verification."}), 500

@student_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for student services."""
    return jsonify({
        "status": "healthy",
        "service": "student_routes",
        "timestamp": datetime.now().isoformat()
    })