import glob
import streamlit as st
from PIL import Image
import torch
import os
import pathlib
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

st.set_page_config(layout="wide")

cfg_model_path = 'models/yolov5s.pt'
model = None
confidence = .1


def image_input(data_src):
    img_file = None
    
    if data_src == 'Sample data':
        img_path = glob.glob('data/sample_images/*')  # Get all sample images
        img_slider = st.slider("Select a test image.", min_value=1, max_value=len(img_path), step=1)
        img_file = img_path[img_slider - 1]  # Select image based on slider (adjust index)
    else:
        img_bytes = st.sidebar.file_uploader("Upload an image", type=['png', 'jpeg', 'jpg'])
        if img_bytes:
            img_file = "data/uploaded_data/upload." + img_bytes.name.split('.')[-1]
            Image.open(img_bytes).save(img_file)

    # Process the selected image (whether sample or uploaded)
    if img_file:
        col1, col2 = st.columns(2)
        with col1:
            st.image(img_file, caption="Selected Image")
        with col2:
            img = infer_image(img_file)
            st.image(img, caption="Model Prediction")
        st.header('Count of Objects:')
        counts = count_objects(model(img))
        # List of hazardous items to segregate
        hazardous_items = ["Bulb", "Mobile", "Battery", "Laptop"]

        for class_name, count in counts.items():
            st.subheader(f"{class_name}: {count}")
            # Highlight hazardous items
            if class_name in hazardous_items:
                color = 'red'
                st.write(f'<h3 style="color:{color}">Dispose {count} {class_name} appropriately.</h3>', unsafe_allow_html=True)


def infer_image(img, size=None):
    model.conf = confidence
    result = model(img, size=size) if size else model(img)
    result.render()
    image = Image.fromarray(result.ims[0])
    return image


@st.cache_resource
def load_model(path, device):
    model_ = torch.hub.load('ultralytics/yolov5', 'custom', path=path, force_reload=True)
    model_.to(device)
    print(f"Model loaded on {device}")
    return model_


def get_user_model():
    model_file = None
    model_bytes = st.sidebar.file_uploader("Upload a model file:", type=['pt'])
    if model_bytes:
        model_file = "models/uploaded_" + model_bytes.name
        with open(model_file, 'wb') as out:
            out.write(model_bytes.read())

    return model_file


def count_objects(detections):
    counts = {}
    for det in detections.xyxy[0]:
        class_id = int(det[5])
        class_name = model.names[class_id]
        if class_name in counts:
            counts[class_name] += 1
        else:
            counts[class_name] = 1
    return counts


def main():
    global model, confidence, cfg_model_path

    st.title("Waste Recognition Dashboard")
    st.sidebar.title("Settings")

    model_src = st.sidebar.radio("Select yolov5 weight file", ["Use demo model", "Use your own model"])
    if model_src == "Use your own model":
        user_model_path = get_user_model()
        if user_model_path:
            cfg_model_path = user_model_path
        st.sidebar.text(cfg_model_path.split("/")[-1])
    st.sidebar.markdown("---")

    if not os.path.isfile(cfg_model_path):
        st.warning("Model file not available!!! Please add it to the model folder.")
    else:
        if torch.cuda.is_available():
            device_option = st.sidebar.radio("Select Device", ['cpu', 'cuda'], disabled=False, index=0)
        else:
            device_option = st.sidebar.radio("Select Device", ['cpu', 'cuda'], disabled=True, index=0)
        model = load_model(cfg_model_path, device_option)
        st.sidebar.markdown("---")

        # confidence = st.sidebar.slider('Confidence', min_value=0.1, max_value=1.0, value=.40)

        if st.sidebar.checkbox("Custom Classes"):
            model_names = list(model.names.values())
            assigned_class = st.sidebar.multiselect("Select Classes", model_names, default=[model_names[0]])
            classes = [model_names.index(name) for name in assigned_class]
            model.classes = classes
        else:
            model.classes = list(model.names.keys())
        st.sidebar.markdown("---")

        data_src = st.sidebar.radio("Select input source: ", ['Sample data', 'Upload your own data'])
        image_input(data_src)


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        pass