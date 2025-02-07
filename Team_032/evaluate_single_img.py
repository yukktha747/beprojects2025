import streamlit as st
import cv2
import numpy as np
from imutils.perspective import four_point_transform
from imutils import contours
import imutils
from PIL import Image

def get_rotation_angle(image):
    """
    Detects the image rotation angle using Hough Line Transform and returns the angle in degrees.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 100, minLineLength=100, maxLineGap=10)
    if lines is not None:
        angles = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = np.arctan2(y2 - y1, x2 - x1) * 180.0 / np.pi
            angles.append(angle)
        
        median_angle = np.median(angles)
        if abs(median_angle) > 15:
            return 0  # Skip correction if extreme rotation
        return median_angle
    else:
        return 0

def rotate_image(image, angle):
    """
    Rotates the image around its center by a specific angle.
    """
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    abs_cos = abs(M[0, 0])
    abs_sin = abs(M[0, 1])
    new_w = int(h * abs_sin + w * abs_cos)
    new_h = int(h * abs_cos + w * abs_sin)
    M[0, 2] += (new_w / 2) - center[0]
    M[1, 2] += (new_h / 2) - center[1]
    rotated_image = cv2.warpAffine(image, M, (new_w, new_h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated_image
def process_image(image, answer_key):
    results = {}

    # Detect rotation and correct the image orientation
    angle = get_rotation_angle(image)
    if abs(angle) > 1:
        st.warning(f"Detected rotation: {angle} degrees. Correcting the image orientation.")
        image = rotate_image(image, angle)

    # Convert to grayscale and apply histogram equalization
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)  # Enhance contrast
    blurred = cv2.GaussianBlur(gray, (7, 7), 0)
    edged = cv2.Canny(blurred, 50, 200, apertureSize=3)

    # Display the edge detection result for debugging
    st.image(edged, caption="Edge Detection", use_column_width=True)

    cnts = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)

    docCnt = None
    if len(cnts) > 0:
        cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
        for c in cnts:
            peri = cv2.arcLength(c, closed=True)
            approx = cv2.approxPolyDP(c, epsilon=peri * 0.05, closed=True)  # Reduce epsilon
            if len(approx) == 4:
                docCnt = approx
                break

    if docCnt is None:
        st.error("Could not find document contours. Please try another image.")
        return None

    # Visualize the detected document contour
    cv2.drawContours(image, [docCnt], -1, (0, 255, 0), 2)
    st.image(image, caption="Detected Document Contour", use_column_width=True)

    # Perspective transform
    paper = four_point_transform(image, docCnt.reshape(4, 2))
    warped = four_point_transform(gray, docCnt.reshape(4, 2))
    thresh = cv2.threshold(warped, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]

    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    questionCnts = []

    for c in cnts:
        (x, y, w, h) = cv2.boundingRect(c)
        ar = w / float(h)
        if w >= 20 and h >= 20 and ar >= 0.9 and ar <= 1.1:
            questionCnts.append(c)

    if len(questionCnts) == 0:
        st.error("No valid question contours detected.")
        return None

    questionCnts = contours.sort_contours(questionCnts, method="top-to-bottom")[0]
    correct = 0

    for (q, i) in enumerate(np.arange(0, len(questionCnts), 5)):
        cnts = contours.sort_contours(questionCnts[i:i+5])[0]
        bubbled = None
        for (j, c) in enumerate(cnts):
            mask = np.zeros(thresh.shape, dtype="uint8")
            cv2.drawContours(mask, [c], -1, 255, -1)
            mask = cv2.bitwise_and(thresh, thresh, mask=mask)
            total = cv2.countNonZero(mask)
            if bubbled is None or total > bubbled[0]:
                bubbled = (total, j)

        k = answer_key[q]
        if k == bubbled[1]:
            correct += 1

    score = (correct / len(answer_key)) * 100
    cv2.putText(paper, "{:.2f}%".format(score), (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

    results["score"] = score
    results["output_image"] = paper
    return results

# Streamlit App
st.title("Exam Scanner with Streamlit")

uploaded_file = st.file_uploader("Upload the scanned exam image", type=["jpg", "jpeg", "png"])
if uploaded_file is not None:
    # Load image
    image = Image.open(uploaded_file)
    image = np.array(image)
    
    # Check if the image is empty
    if image is None or image.size == 0:
        st.error("The uploaded image is empty or invalid.")
    else:
        st.image(image, caption="Uploaded Image", use_column_width=True)
        
        # Define Answer Key
        st.sidebar.header("Answer Key")
        answer_key = {0: 1, 1: 4, 2: 0, 3: 3, 4: 1}  # Static example
        for i in range(5):
            answer_key[i] = st.sidebar.selectbox(f"Answer for Q{i+1}", [0, 1, 2, 3, 4], index=answer_key[i])
        
        # Process the image
        with st.spinner("Processing the image..."):
            result = process_image(image, answer_key)
        
        if result:
            st.success(f"Score: {result['score']:.2f}%")
            st.image(result["output_image"], caption="Processed Image", use_column_width=True)
