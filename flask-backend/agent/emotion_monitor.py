# emotion_monitor.py
import cv2
from fer import FER
from collections import deque
import time
import mediapipe as mp

import numpy as np


class EmotionMonitorService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmotionMonitorService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self.emotion_detector = FER(mtcnn=True)
        self.cap = cv2.VideoCapture(0)
        self.is_running = True
        self.is_monitoring = False
        self.emotion_buffer = deque(maxlen=10)
        self.landmark_buffer = deque(maxlen=10)  # Store recent landmark data

        self.monitoring_duration = 0
        self.monitoring_start = 0
        
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        self.drawing_spec = self.mp_drawing.DrawingSpec(thickness=1, circle_radius=1)

        # Hardcoding the language pronunciation guide to french for now 
        self.pronunciation_guide = LanguagePronunciationGuide('french')
        
        if not self.cap.isOpened():
            raise RuntimeError("Could not open video capture device")
        
        self._initialized = True

    def process_landmarks(self, frame):
        """Process facial landmarks using MediaPipe"""
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(frame_rgb)
        
        if results.multi_face_landmarks:
            face_landmarks = results.multi_face_landmarks[0]  # Get first face
            
            # Store landmark positions
            landmark_positions = []
            for landmark in face_landmarks.landmark:
                h, w, _ = frame.shape
                x, y = int(landmark.x * w), int(landmark.y * h)
                landmark_positions.append((x, y))
            
            self.landmark_buffer.append(landmark_positions)
            
            # Draw landmarks on frame for face
            self.mp_drawing.draw_landmarks(
                image=frame,
                landmark_list=face_landmarks,
                connections=self.mp_face_mesh.FACEMESH_TESSELATION,
                landmark_drawing_spec=None,
                connection_drawing_spec=self.mp_drawing_styles.get_default_face_mesh_tesselation_style()
            )

            # Draw landmarks on frame for lips
            self.mp_drawing.draw_landmarks(
                image=frame,
                landmark_list=face_landmarks,
                connections=self.mp_face_mesh.FACEMESH_LIPS,
                landmark_drawing_spec=None,
                connection_drawing_spec=self.mp_drawing.DrawingSpec(
                    color=(0, 0, 255), thickness=2)
            )
            
            return landmark_positions
        return None

    def run_video_display(self):
        """Main video loop - runs in main thread"""
        cv2.namedWindow('Emotion Monitor', cv2.WINDOW_NORMAL)
        
        while self.is_running:
            ret, frame = self.cap.read()
            if not ret:
                continue

            # Process emotions at the same time
            if self.is_monitoring:
                emotions = self.emotion_detector.detect_emotions(frame)
                if emotions:
                    emotion_dict = emotions[0]['emotions']
                    dominant = max(emotion_dict.items(), key=lambda x: x[1])
                    self.emotion_buffer.append(dominant)
                    cv2.putText(frame, f"Emotion: {dominant[0]}", 
                              (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                              1, (0, 255, 0), 2)
                
                # Process landmarks
                landmarks = self.process_landmarks(frame)
                if landmarks:
                    # You can add additional visualization or processing here
                    cv2.putText(frame, "Landmarks detected", 
                              (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 
                              1, (0, 255, 0), 2)
                    
                if time.time() - self.monitoring_start >= self.monitoring_duration:
                    self.is_monitoring = False
            else:
                cv2.putText(frame, "Ready", (10, 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                # Still process landmarks when not monitoring emotions
                self.process_landmarks(frame)

            cv2.imshow('Emotion Monitor', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                self.is_running = False
                break

    def start_monitoring(self, duration: float) -> bool:
        self.emotion_buffer.clear()
        self.monitoring_duration = duration
        self.monitoring_start = time.time()
        self.is_monitoring = True
        return True

    def get_dominant_emotion(self):
        if not self.emotion_buffer:
            return None

        emotion_counts = {}
        for emotion, score in self.emotion_buffer:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + score

        dominant = max(emotion_counts.items(), key=lambda x: x[1])
        return {
            'emotion': dominant[0],
            'score': dominant[1] / len(self.emotion_buffer),
            'confidence': len(self.emotion_buffer) / self.monitoring_duration
        }

    def stop(self):
        """Stop video processing and release all resources"""
        self.is_running = False
        if self.cap is not None:
            self.cap.release()
        self.face_mesh.close()    
        cv2.destroyAllWindows()

    def analyze_mouth_shape(self, landmarks):
        """Analyze mouth shape for pronunciation feedback"""
        # MediaPipe indices for mouth landmarks
        UPPER_LIP = [13, 312, 311, 310, 415, 308]
        LOWER_LIP = [14, 317, 402, 318, 324, 308]
        
        # Extract mouth landmarks
        upper_lip_pts = [landmarks[i] for i in UPPER_LIP]
        lower_lip_pts = [landmarks[i] for i in LOWER_LIP]
        
        # Calculate mouth metrics
        mouth_height = np.mean([abs(u[1] - l[1]) for u, l in zip(upper_lip_pts, lower_lip_pts)])
        mouth_width = abs(landmarks[308][0] - landmarks[78][0])
        
        # Analyze mouth shape
        shape_analysis = {
            'openness': mouth_height / mouth_width,  # Ratio of height to width
            'roundness': mouth_width / mouth_height < 2.5,  # True if mouth is relatively round
            'spread': mouth_width > self.neutral_mouth_width * 1.2 if hasattr(self, 'neutral_mouth_width') else None
        }
        
        # Map to pronunciation feedback
        feedback = None
        if shape_analysis['openness'] < 0.2:
            feedback = "Try opening your mouth more"
        elif shape_analysis['roundness']:
            feedback = "Good round shape for vowel sounds"
        elif shape_analysis['spread']:
            feedback = "Good spread position for 'ee' sounds"
            
        return {
            'metrics': shape_analysis,
            'feedback': feedback
        }

    def calibrate_neutral_position(self):
        """Calibrate neutral mouth position for baseline"""
        if not self.landmark_buffer:
            return False
            
        # Get average mouth width in neutral position
        landmarks = self.landmark_buffer[-1]  # Use most recent landmarks
        self.neutral_mouth_width = abs(landmarks[308][0] - landmarks[78][0])
        return True

    #============
    # Tongue Position 
    def detect_tongue_position(self, frame, landmarks):
        """Basic tongue position detection for pronunciation feedback"""
        # MediaPipe indices for inner mouth region
        INNER_MOUTH = [78, 308, 14, 13]
        
        # Create mask for inner mouth region
        h, w = frame.shape[:2]
        mask = np.zeros((h, w), dtype=np.uint8)
        mouth_pts = np.array([landmarks[i] for i in INNER_MOUTH], dtype=np.int32)
        cv2.fillPoly(mask, [mouth_pts], 255)
        
        # Apply mask to frame
        mouth_region = cv2.bitwise_and(frame, frame, mask=mask)
        
        # Convert to HSV and look for pink/red colors (tongue)
        hsv = cv2.cvtColor(mouth_region, cv2.COLOR_BGR2HSV)
        lower_pink = np.array([145, 30, 30])
        upper_pink = np.array([175, 255, 255])
        tongue_mask = cv2.inRange(hsv, lower_pink, upper_pink)
        
        # Calculate tongue position metrics
        tongue_pixels = cv2.countNonZero(tongue_mask)
        mouth_area = cv2.contourArea(mouth_pts)
        
        if tongue_pixels > 0:
            # Find tongue contour centroid
            M = cv2.moments(tongue_mask)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                
                # Compare with mouth center
                mouth_center = np.mean(mouth_pts, axis=0)
                
                return {
                    'visible': True,
                    'position': 'front' if cy < mouth_center[1] else 'back',
                    'relative_height': (mouth_center[1] - cy) / mouth_area if mouth_area > 0 else 0
                }
        
        return {'visible': False}
    
    def analyze_pronunciation(self, phoneme):
        """Analyze pronunciation for a specific phoneme"""
        print("Starting analysis yayay")

        print((not self.landmark_buffer))
        print((not hasattr(self, 'pronunciation_guide')))

        # if not self.landmark_buffer or not hasattr(self, 'pronunciation_guide'):
        if not self.landmark_buffer:
            print("is this failing?")
            return None
        
        print("Hello we got in here")
            
        # Get latest landmarks and analyze mouth shape
        landmarks = self.landmark_buffer[-1]
        mouth_analysis = self.analyze_mouth_shape(landmarks)

        print(mouth_analysis)
        
        # Get current frame for tongue analysis
        ret, frame = self.cap.read()
        tongue_position = self.detect_tongue_position(frame, landmarks) if ret else {'visible': False}
        
        # Get language-specific feedback
        feedback = self.pronunciation_guide.get_feedback(
            phoneme,
            mouth_analysis['metrics'],
            tongue_position
        )
        
        return {
            'feedback': feedback,
            'mouth_metrics': mouth_analysis['metrics'],
            'tongue_position': tongue_position
        }

class LanguagePronunciationGuide:
    """Language-specific pronunciation configurations and feedback"""
    
    def __init__(self, language='french'):
        self.language = language.lower()
        self.pronunciation_configs = {
            'french': {
                # French specific mouth shapes and positions - using expected Landmark positions from Mediapipe
                'rounded_vowels': {
                    'u': {'openness': 0.15, 'roundness': True, 'spread': False},  # as in 'tu'
                    'ou': {'openness': 0.2, 'roundness': True, 'spread': False},  # as in 'vous'
                    'eu': {'openness': 0.25, 'roundness': True, 'spread': False}, # as in 'deux'
                },
                'nasal_vowels': {
                    'an': {'openness': 0.4, 'roundness': False, 'spread': True},  # as in 'dans'
                    'on': {'openness': 0.3, 'roundness': True, 'spread': False},  # as in 'bon'
                    'in': {'openness': 0.25, 'roundness': False, 'spread': True}, # as in 'pain'
                },
                'tongue_positions': {
                    'r': {'position': 'back', 'relative_height': 0.6},  # French uvular R
                    'l': {'position': 'front', 'relative_height': 0.7}, # French L
                }
            }
            # Add other languages here with their specific configs
        }
        print("Guide initialized successfully")

    def get_feedback(self, phoneme, mouth_metrics, tongue_data):
        """Generate language-specific feedback for a given phoneme"""
        if self.language not in self.pronunciation_configs:
            return "Language not supported for detailed feedback"
            
        config = self.pronunciation_configs[self.language]
        feedback = []
        
        # French-specific feedback
        if self.language == 'french':
            print("Successfully identified french")
            # Check rounded vowels
            if phoneme in config['rounded_vowels']:
                expected = config['rounded_vowels'][phoneme]
                if abs(mouth_metrics['openness'] - expected['openness']) > 0.1:
                    if mouth_metrics['openness'] > expected['openness']:
                        feedback.append("Fermez un peu plus les lèvres (Close your lips a bit more)")
                    else:
                        feedback.append("Ouvrez un peu plus les lèvres (Open your lips a bit more)")
                
                if expected['roundness'] and not mouth_metrics['roundness']:
                    feedback.append("Arrondissez plus les lèvres (Round your lips more)")
            
            # Check nasal vowels
            elif phoneme in config['nasal_vowels']:
                expected = config['nasal_vowels'][phoneme]
                if abs(mouth_metrics['openness'] - expected['openness']) > 0.1:
                    feedback.append("Ajustez l'ouverture pour le son nasal (Adjust opening for nasal sound)")
                    
            # Check tongue position for 'r' sound
            elif phoneme == 'r' and tongue_data['visible']:
                if tongue_data['position'] != 'back':
                    feedback.append("Placez la langue plus en arrière pour le 'R' français (Place tongue further back for French 'R')")
                    
        return feedback if feedback else ["Très bien! (Very good!)"]



