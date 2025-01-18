from flask import Flask, request, jsonify
from flask_cors import CORS
from agent.emotion_monitor import EmotionMonitorService
from agent.translation import *


import threading
import logging
import time

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('flask_cors')
logger.level = logging.DEBUG

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize emotion monitor service
emotion_service = EmotionMonitorService()

@app.after_request
def log_response(response):
    print(f"Response Status: {response.status}")
    print(f"Response Headers: {dict(response.headers)}")
    return response

@app.route('/test', methods=['GET', 'POST', 'OPTIONS'])
def test():
    print("Request received!")
    print("Method:", request.method)
    print("Headers:", dict(request.headers))
    return jsonify({"message": "Test successful!"})

# ================================================
# Translation Endpoints
@app.route('/api/translation', methods=['POST'])
def generate_llm_translation():
    """
    Use Claude to generate a translation of what the user is trying to 
    learn how to say.
    """
    # TODO: modify this to include the right field names
    try:
        data = request.get_json()
        prompt = data.get('prompt', "Hello")    # simple default value
        language = data.get('language', "Mandarin")

        # Generate the response to the user's prompt
        response = generate_language_response(prompt, language)[0].text
        # print(response)

        return jsonify({
            'status': 'success',
            'message': response
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to generate translation.'
        }), 500
#=============================================================

#=============================================================
# CV Monitoring Endpoints
@app.route('/api/monitor/start', methods=['POST'])
def start_monitoring():
    """Start monitoring emotions"""
    try:
        data = request.get_json()
        duration = float(data.get('duration', 5.0))
        
        if emotion_service.start_monitoring(duration):
            return jsonify({
                'status': 'success',
                'message': f'Started monitoring for {duration} seconds'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to start monitoring'
            }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    
@app.route('/api/monitor/result', methods=['GET'])
def get_result():
    """Get the emotional response result"""
    try:
        emotion_data = emotion_service.get_dominant_emotion()
        
        # TODO: Can potentially make confusion indicators more sensitive by just treating
        # it as if confusion exists when we see neutral, surprise, and anger all in one buffer or something
        if emotion_data:
            # Determine if follow-up is needed
            confusion_indicators = {
                'neutral': 0.7,
                'surprise': 0.6,
                'fear': 0.5,
                'sad': 0.5
            }
            
            needs_followup = (
                emotion_data['emotion'] in confusion_indicators and 
                emotion_data['score'] > confusion_indicators[emotion_data['emotion']]
            )
            
            return jsonify({
                'status': 'success',
                'data': {
                    'emotion': emotion_data,
                    'needs_followup': needs_followup
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'No emotion data available'
            }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/monitor/pronunciation', methods=['GET'])
def get_pronunciation_feedback():
    """
    """
    try:
        # Get the latest landmark data
        landmarks = emotion_service.landmark_buffer[-1] if emotion_service.landmark_buffer else None
        if not landmarks:
            return jsonify({
                'status': 'error',
                'message': 'No landmark data available'
            }), 404
        
        # Get mouth shape analysis
        mouth_feedback = emotion_service.analyze_mouth_shape(landmarks)

        # Get current frame for tongue analysis
        ret, frame = emotion_service.cap.read()
        tongue_position = emotion_service.detect_tongue_position(frame, landmarks) if ret else None

        return jsonify({
            'status': 'success',
            'data': {
                'mouth_shape': mouth_feedback,
                'tongue_position': tongue_position
            }
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

#=========================================================================

# Run the app
if __name__ == '__main__':
    # Start Flask in a daemon thread
    flask_thread = threading.Thread(
        target=lambda: app.run(host='0.0.0.0', port=8000, debug=False)
    )
    flask_thread.daemon = True
    flask_thread.start()
    
    # Run OpenCV in main thread
    try:
        emotion_service.run_video_display()
    finally:
        emotion_service.stop()