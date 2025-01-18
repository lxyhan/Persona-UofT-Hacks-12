# Local Setup

Local setup can be a little bit tricky at times, particularly due to issues that can 
be frequently encountered using TensorFlow on an Apple Silicon Chip (note: these
instructions are for Mac with M-series chips only).

1. Install Conda and use it to handle dependencies for tensorflow
```
# Create a conda environment and install tensorflow-deps only!
conda create -n tf-mac tensorflow-deps

# Activate the environment
conda activate tf-mac
```

2. Create a python virtual environment to handle everything else (yeah..., this is a little messy but it works!)
```
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

3. Verify that you can run a Flask App
```
python backend/app.py
```
If the server boots up to http://127.0.0.1:5000 without any issues, then it's working! 
You can send some simple requests to the API via your tool of choice (Postman, Insomnia, etc.)
to verify that the logic of your endpoints is working.

4. Verify that you can run the CV + TensorFlow workflows
```
# Run a simple script that uses FER for emotion recognition and mediapipe for gesture landmarking
python backend/cv_testing.py
``` 
If you get an OpenCV window pop up using your camera to show a live video feed (likely continuity camera 
if you have an iPhone) then it is working! 

