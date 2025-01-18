from flask import Flask, request, jsonify
from flask_cors import CORS
from agent.emotion_monitor import EmotionMonitorService, LanguagePronunciationGuide
from agent.translation import *


import threading
import logging
import time

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger()
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
        language = data.get('language', "French")

        # Generate the response to the user's prompt
        response = generate_translation_response(prompt, language)[0].text
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
    
@app.route('/api/monitor/pronunciation', methods=['POST'])
def check_pronunciation():
    """Check pronunciation for a specific phoneme in a specific language"""
    # Too many requests causes seg faults???? be careful
    try:
        data = request.get_json()
        phoneme = data.get('phoneme', '')
        language = data.get('language', 'french')  # default to French

        logger.info("Parsed Pronunciation request")
        
        # Initialize pronunciation guide if needed
        if not hasattr(emotion_service, 'pronunciation_guide'):
            emotion_service.pronunciation_guide = LanguagePronunciationGuide(language)
        elif emotion_service.pronunciation_guide.language != language:
            emotion_service.pronunciation_guide = LanguagePronunciationGuide(language)
        
        logger.info("Created pronunciation guide")

        # Get pronunciation analysis
        analysis = emotion_service.analyze_pronunciation(phoneme)
        feedback = analysis['feedback']
        
        if analysis:
            return jsonify({
                'status': 'success',
                'data': feedback
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'No pronunciation data available'
            }), 404
            
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