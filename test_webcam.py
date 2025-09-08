import cv2
import face_recognition
import os
import numpy as np
from PIL import Image
from datetime import datetime
import csv
import mediapipe as mp


path = 'known_faces'
known_images = []
known_names = []

for file_name in os.listdir(path):
    if not file_name.lower().endswith(('.jpg', '.jpeg', '.png')):
        continue
    file_path = os.path.join(path, file_name)
    try:
        img = np.array(Image.open(file_path).convert('RGB'))
        known_images.append(img)
        known_names.append(os.path.splitext(file_name)[0])
    except Exception as e:
        print(f"Skipping file {file_name}: {e}")


known_encodings = []
for img in known_images:
    encodings = face_recognition.face_encodings(img)
    if encodings:
        known_encodings.append(encodings[0])

print("Loaded known faces:", known_names)


mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.5)


cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open webcam")
    exit()

cv2.namedWindow("Face & Gesture Detection", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Face & Gesture Detection", 800, 600)

face_detected = False
person_name = None

print("Starting webcam...")

def classify_thumb(landmarks):
    """
    Simple logic for thumbs up / thumbs down based on thumb tip and MCP landmarks.
    Returns 'up', 'down', or None
    """
    
    tip_y = landmarks[4].y
    mcp_y = landmarks[2].y

    
    fingers_folded = all(landmarks[i].y > landmarks[i - 2].y for i in [8, 12, 16, 20])

    if fingers_folded:
        if tip_y < mcp_y:
            return "up"
        elif tip_y > mcp_y:
            return "down"
    return None

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    if not face_detected:
        
        face_locations = face_recognition.face_locations(rgb_small_frame, model="hog")
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        face_names = []

        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_encodings, face_encoding)
            name = "Unknown"
            face_distances = face_recognition.face_distance(known_encodings, face_encoding)
            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_names[best_match_index]
            face_names.append(name)

        if face_names:
            face_detected = True
            person_name = face_names[0]
            print(f"Face detected: {person_name}")

    else:
        
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb_frame)
        gesture = None

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                gesture = classify_thumb(hand_landmarks.landmark)
                mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                if gesture:
                    break  

        if gesture == "up":
            
            time_now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            with open('attendance.csv', mode='a', newline='') as file:
                writer = csv.writer(file)
                writer.writerow([person_name, time_now])
            print(f"Attendance logged for {person_name} at {time_now}")
            break
        elif gesture == "down":
            print("Thumbs down detected, exiting without logging")
            break

    
    if face_detected:
        for (top, right, bottom, left) in face_locations:
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, person_name, (left, top-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    cv2.imshow("Face & Gesture Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

