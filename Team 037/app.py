import os
import uuid
import cv2
import numpy as np
from flask import Flask, render_template, request, Response, send_from_directory
from werkzeug.utils import secure_filename
from deepfake_detection import predict
import threading
import queue

app = Flask(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

# Ensure upload and output directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_video_stream(input_path, output_queue):
    video_capture = cv2.VideoCapture(input_path)
    
    while True:
        result, video_frame = video_capture.read()
        if not result:
            break
        
        processed_frame = predict(video_frame.copy())
        output_queue.put(processed_frame)
    
    output_queue.put(None)  # Signal end of video
    video_capture.release()

@app.route('/', methods=['GET', 'POST'])
def upload_video():
    if request.method == 'POST':
        # Check if a file was uploaded
        if 'video' not in request.files:
            return render_template('index.html', error='No file uploaded')
        
        file = request.files['video']
        
        # If no file is selected
        if file.filename == '':
            return render_template('index.html', error='No selected file')
        
        # If file is valid
        if file and allowed_file(file.filename):
            # Generate a unique filename
            filename = str(uuid.uuid4()) + secure_filename(file.filename)
            input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Save the uploaded file
            file.save(input_path)
            
            # Return the filename for rendering in the template
            return render_template('index.html', input_video=filename, original_video=filename)

    return render_template('index.html')

@app.route('/process_video/<filename>')
def process_video_stream_route(filename):
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    # Create a queue for processed frames
    output_queue = queue.Queue(maxsize=100)
    
    # Start video processing in a separate thread
    processing_thread = threading.Thread(
        target=process_video_stream, 
        args=(input_path, output_queue)
    )
    processing_thread.start()
    
    def generate():
        while True:
            frame = output_queue.get()
            if frame is None:
                break
            
            # Encode the frame to JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    
    return Response(generate(), 
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)