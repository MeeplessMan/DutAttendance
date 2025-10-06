# File: backend/__init__.py

import os, sys, io, base64, math
from flask import Flask, jsonify, request
from flask_cors import CORS
import cv2, dlib, numpy as np
from supabase import create_client, Client
import requests
from PIL import Image

# --- GLOBAL VARIABLES ---
detector = None
sp = None
facerec = None
supabase = None
known_encodings = []
known_names = []


def load_known_faces():
    """
    Reloads all facial encodings from the database.
    This is run on app start and after a new user enrolls their face.
    """
    global known_encodings, known_names, supabase
    known_encodings, known_names = [], []
    print("Reloading known faces from Supabase...")
    
    # Get users with face embeddings
    response = supabase.table("User").select("id, first_name, face_embedding").not_.is_("face_embedding", "null").execute()
    
    for user in response.data:
        try:
            user_name = user["first_name"]
            embedding = user.get("face_embedding")
            
            if embedding and isinstance(embedding, list):
                # We need a unique identifier, combining ID and name for safety
                known_encodings.append(np.array(embedding))
                known_names.append(user_name) 
                
        except Exception as e:
            print(f"ERROR processing user '{user.get('first_name', 'unknown')}': {e}")
            
    print(f"--- Successfully loaded {len(known_names)} faces: {known_names} ---")


def create_app():
    """The Application Factory"""
    global detector, sp, facerec, supabase
    
    app = Flask(__name__)
    CORS(app)

    # --- Initialize Supabase Client ---
    url: str = "https://sqmzejbfenaeurgaxfoc.supabase.co/"
    key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxbXplamJmZW5hZXVyZ2F4Zm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc1MDc2MSwiZXhwIjoyMDcyMzI2NzYxfQ.HU27_CovPgxsmwVFZZ1fpHgX8ZdqPay_HBoBXP0Lu_4"
    supabase = create_client(url, key)
    print("--- Supabase client initialized ---")
    
    # --- Initialize DLIB Models ---
    try:
        import sys, os
        site_packages_path = next(p for p in sys.path if 'site-packages' in p)
        models_path = os.path.join(site_packages_path, 'face_recognition_models', 'models')
        predictor_path = os.path.join(models_path, 'shape_predictor_68_face_landmarks.dat')
        face_rec_model_path = os.path.join(models_path, 'dlib_face_recognition_resnet_model_v1.dat')
        detector = dlib.get_frontal_face_detector()
        sp = dlib.shape_predictor(predictor_path)
        facerec = dlib.face_recognition_model_v1(face_rec_model_path)
        print("--- Successfully loaded dlib models ---")
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to load dlib models. Check installations. {e}")

    # --- Load Initial Face Data ---
    with app.app_context():
        load_known_faces()

    # --- Health Check Endpoint ---
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "message": "Backend is running"})

    # --- Missing Student Profile Endpoint ---
    @app.route('/api/student/profile', methods=['GET'])
    def get_student_profile():
        try:
            student_id = request.args.get('studentId')
            if not student_id:
                return jsonify({'error': 'Student ID is required'}), 400
            
            # Get user data from Supabase
            response = supabase.table('User').select('*').eq('id', student_id).execute()
            
            if not response.data:
                return jsonify({'error': 'Student not found'}), 404
            
            student_data = response.data[0]
            
            # Get student group info if available
            group_info = {}
            if student_data.get('student_group_id'):
                group_response = supabase.table('StudentGroup').select('*').eq('id', student_data['student_group_id']).execute()
                if group_response.data:
                    group_info = group_response.data[0]
            
            profile_data = {
                'id': student_data['id'],
                'first_name': student_data['first_name'],
                'surname': student_data['surname'],
                'email': student_data['email'],
                'student_number': student_data['student_num'],
                'faculty': student_data.get('faculty', ''),
                'role': student_data['role'],
                'student_group': group_info
            }
            
            return jsonify(profile_data)
            
        except Exception as e:
            print(f"Error fetching student profile: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500

    # --- Missing Student Timetable Endpoint (Fixed) ---
    @app.route('/api/student/timetable', methods=['GET'])
    def get_student_timetable():
        try:
            student_id = request.args.get('studentId')
            if not student_id:
                return jsonify({'error': 'Student ID is required'}), 400
            
            # First get the student's group ID
            user_response = supabase.table('User').select('student_group_id').eq('id', student_id).execute()
            
            if not user_response.data:
                return jsonify({'error': 'Student not found'}), 404
            
            student_group_id = user_response.data[0].get('student_group_id')
            
            if not student_group_id:
                return jsonify([])  # No group assigned, return empty timetable
            
            # Get timetable entries for the student's group
            timetable_response = supabase.table('Schedule')\
                .select('*, Module(*, User(first_name, surname)), Venue(*)')\
                .eq('student_group_id', student_group_id)\
                .execute()
            
            return jsonify(timetable_response.data)
            
        except Exception as e:
            print(f"Error fetching student timetable: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500

    # --- Missing Student Attendance Endpoint ---
    @app.route('/api/student/attendance', methods=['GET'])
    def get_student_attendance():
        try:
            student_id = request.args.get('studentId')
            if not student_id:
                return jsonify({'error': 'Student ID is required'}), 400
            
            # Get attendance records
            attendance_response = supabase.table('Attendance')\
                .select('*, Event(*, Schedule(*, Module(*)))')\
                .eq('student_id', student_id)\
                .order('timestamp', desc=True)\
                .execute()
            
            return jsonify(attendance_response.data)
            
        except Exception as e:
            print(f"Error fetching student attendance: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
   
    # --- Import and Register Blueprints ---
    from .routes import student_routes, admin_routes, lecturer_routes
    app.register_blueprint(student_routes.student_bp, url_prefix='/api/student')
    app.register_blueprint(admin_routes.admin_bp, url_prefix='/api/admin')
    app.register_blueprint(lecturer_routes.lecturer_bp, url_prefix='/api/lecturer')
    
    return app