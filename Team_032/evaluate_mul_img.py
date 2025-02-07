import streamlit as st
import cv2
import numpy as np
from imutils.perspective import four_point_transform
from imutils import contours
import imutils
from PIL import Image
import pandas as pd

# Function to detect the rotation angle of the image
def get_rotation_angle(image):
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
        return median_angle
    return 0

# Function to rotate the image based on the detected angle
def rotate_image(image, angle):
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    abs_cos = abs(M[0, 0])
    abs_sin = abs(M[0, 1])
    new_w = int(h * abs_sin + w * abs_cos)
    new_h = int(h * abs_cos + w * abs_sin)
    M[0, 2] += (new_w / 2) - center[0]
    M[1, 2] += (new_h / 2) - center[1]
    return cv2.warpAffine(image, M, (new_w, new_h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

# Function to process an individual image
def process_image(image, answer_key):
    results = {"score": None, "rotation_angle": None, "error": None}
    try:
        # Step 1: Get and correct the rotation angle
        angle = get_rotation_angle(image)
        results["rotation_angle"] = angle
        if abs(angle) > 1:
            image = rotate_image(image, angle)

        # Step 2: Preprocess the image
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)
        edged = cv2.Canny(blurred, 50, 200, apertureSize=3)

        # Step 3: Find the contours of the paper
        cnts = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cnts = imutils.grab_contours(cnts)
        docCnt = None
        if len(cnts) > 0:
            cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
            for c in cnts:
                peri = cv2.arcLength(c, True)
                approx = cv2.approxPolyDP(c, 0.02 * peri, True)
                if len(approx) == 4:
                    docCnt = approx
                    break
        if docCnt is None:
            raise ValueError("Paper not detected")

        # Step 4: Apply perspective transform
        paper = four_point_transform(image, docCnt.reshape(4, 2))
        warped = four_point_transform(gray, docCnt.reshape(4, 2))
        thresh = cv2.threshold(warped, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]

        # Step 5: Find the question bubbles
        cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cnts = imutils.grab_contours(cnts)
        questionCnts = []

        for c in cnts:
            (x, y, w, h) = cv2.boundingRect(c)
            ar = w / float(h)
            if w >= 20 and h >= 20 and 0.9 <= ar <= 1.1:
                questionCnts.append(c)
        if len(questionCnts) == 0:
            raise ValueError("No valid bubbles detected")

        # Sort and grade the bubbles
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
        results["score"] = (correct / len(answer_key)) * 100
        return results
    except Exception as e:
        results["error"] = str(e)
        return results

# Streamlit Application
st.title("OMR Exam Scanner")

# File upload section
uploaded_files = st.file_uploader("Upload scanned OMR sheets", type=["jpg", "jpeg", "png"], accept_multiple_files=True)

if uploaded_files:
    st.sidebar.header("Answer Key")
    answer_key = {i: st.sidebar.selectbox(f"Answer for Q{i+1}", [0, 1, 2, 3, 4], index=0) for i in range(5)}

    results = []
    for uploaded_file in uploaded_files:
        image = Image.open(uploaded_file)
        image = np.array(image)
        result = process_image(image, answer_key)
        results.append({
            "File Name": uploaded_file.name,
            "Rotation Angle": result["rotation_angle"],
            "Score": result["score"],
            "Status": "Passed" if result["score"] and result["score"] >= 40 else "Failed",
            "Error": result["error"]
        })

    # Display and save results
    df = pd.DataFrame(results)
    st.dataframe(df)
    csv_file = "results.csv"
    df.to_csv(csv_file, index=False)
    st.download_button("Download Results CSV", data=open(csv_file, "rb"), file_name="results.csv")
