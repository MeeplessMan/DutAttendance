import cv2
import pkgutil
if not hasattr(pkgutil, "ImpImporter"):
    pkgutil.ImpImporter = pkgutil.zipimporter
import face_recognition
import numpy as np
from supabase import create_client
import requests
from PIL import Image
import io


url = "https://sqmzejbfenaeurgaxfoc.supabase.co/"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxbXplamJmZW5hZXVyZ2F4Zm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc1MDc2MSwiZXhwIjoyMDcyMzI2NzYxfQ.HU27_CovPgxsmwVFZZ1fpHgX8ZdqPay_HBoBXP0Lu_4"
supabase = create_client(url, key)

known_encodings = []
known_names = []


response = supabase.table("User").select("firstName, image").execute()
users = response.data

for user in users:
    try:
        
        res = requests.get(user["image"])
        res.raise_for_status() 
        
        
        img = np.array(Image.open(io.BytesIO(res.content)).convert("RGB"))
        
        
        encoding = face_recognition.face_encodings(img)[0]
        known_encodings.append(encoding)
        known_names.append(user["firstName"])
    except Exception as e:
        print(f"Skipping user {user.get('firstName', 'unknown')}: {e}")

print("Loaded faces:", known_names)



cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open webcam")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    
    face_locations = face_recognition.face_locations(rgb_small_frame)
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

    for face_encoding, face_location in zip(face_encodings, face_locations):
        
        matches = face_recognition.compare_faces(known_encodings, face_encoding)
        name = "Unknown"

        face_distances = face_recognition.face_distance(known_encodings, face_encoding)
        if len(face_distances) > 0:
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                name = known_names[best_match_index]

        
        top, right, bottom, left = face_location
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4

        cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
        cv2.putText(frame, name, (left, top-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    cv2.imshow("Face Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()