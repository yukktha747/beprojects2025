

import sys
import cv2
from deepfake_detection import predict

def process_video_generator(input_path):
    video_capture = cv2.VideoCapture(input_path)
    
    # Process video frames
    while True:
        result, video_frame = video_capture.read()
        if result is False:
            break
        
        processed_frame = predict(video_frame.copy())
        yield processed_frame
    
    video_capture.release()
    cv2.destroyAllWindows()

def process_video(input_path, output_path):
    video_capture = cv2.VideoCapture(input_path)
    
    # Get video properties
    width = int(video_capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video_capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = video_capture.get(cv2.CAP_PROP_FPS)
    
    # VideoWriter object
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Process video frames
    while True:
        result, video_frame = video_capture.read()
        if result is False:
            break
        
        processed_frame = predict(video_frame.copy())
        out.write(processed_frame)
    
    video_capture.release()
    out.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python process_video.py <input_video> <output_video>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    process_video(input_path, output_path)