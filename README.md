# Persona 🎭 
## Real-time AI Language Learning Assistant
[![UofTHacks 2025 Winner](https://img.shields.io/badge/UofTHacks%202025-1st%20Place-gold)](https://github.com/yourusername/persona)
## Awards 🏆
- First Place - UofTHacks 2025

Persona transforms language learning through an immersive AI tutoring experience that adapts to you in real-time. By combining computer vision, neural networks, and 3D animation, Persona creates a natural learning environment that understands and responds to your facial expressions, pronunciation, and learning style.

## Features 🌟

- **Real-time Emotional Understanding**: Analyzes facial expressions to gauge engagement and understanding
- **Precise Pronunciation Feedback**: Tracks lip movements for accurate pronunciation guidance
- **Fluid 3D Animation**: Generates natural, lip-synced character animations that respond to your interactions
- **Adaptive Learning**: Personalizes conversations and lessons based on your progress and learning style
- **Multi-modal Processing**: Simultaneously handles video, audio, and text inputs for seamless interaction

## Technical Architecture 🔧

### Computer Vision Pipeline
- Continuous facial analysis using deep learning models
- Advanced facial landmark detection
- Emotion recognition neural networks
- Multi-threaded feature extraction

### 3D Animation System
- Real-time rigging and animation (Mixamo + Blender)
- Live lip-sync through Rhubarb phoneme detection
- Custom animation blending
- Synchronized facial expression mapping

### Natural Language Processing
- WhisperAPI for speech-to-text
- ElevenLabs for dynamic voice generation
- Claude-powered conversation engine
- Parallel AI model processing

## Getting Started 🚀

### Prerequisites
```bash
# Required packages
python >= 3.8
pytorch >= 2.0
opencv-python
tensorflow
```

### Installation
```bash
git clone https://github.com/yourusername/persona.git
cd persona
pip install -r requirements.txt
```

### Running Persona
```bash
python main.py
```

## System Requirements 💻

- **CPU**: 4+ cores recommended for parallel processing
- **GPU**: NVIDIA GPU with CUDA support (8GB+ VRAM recommended)
- **RAM**: 16GB minimum
- **Storage**: 5GB for models and basic assets
- **Webcam**: Required for facial analysis
- **Microphone**: Required for speech input

## Architecture Overview 🏗️

The system operates through a microservices architecture that coordinates multiple processes:
1. Video Processing Service
   - Handles real-time facial analysis
   - Extracts emotional and pronunciation features
2. Animation Service
   - Generates fluid 3D character movements
   - Synchronizes lip movements with speech
3. Conversation Service
   - Manages AI dialogue flow
   - Processes language learning logic
4. Integration Layer
   - Orchestrates all services
   - Maintains real-time performance
