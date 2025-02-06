# E-Waste Management Using Deep Learning
(Involves YOLOv5 Training on Custom Dataset)

## Prerequisites

- Google Colab account
- T4 GPU runtime enabled (In Colab, Go to `Runtime` > `Change runtime type` > Select `GPU` and ensure it's `T4`)
- A dataset (download link provided below)
- Files from this repository

## Setup Instructions for Model Creation (`.pt` file)

### 1. Prepare the Dataset

- Download the dataset here: [Dataset in zip format](https://drive.google.com/file/d/1prlkkDuqC3PDdpsBb34ajnk_SGydKCIy/view?usp=sharing)
- Before proceeding, ensure that you have downloaded the dataset ZIP file and placed it in a folder named `Dataset` in your Google Drive.
- Run the following commands, which are already present in the jupyter notebook.

##### Step 1: Mount Google Drive

```python
from google.colab import drive
drive.mount('/content/drive', force_remount=True)
```

##### Step 2: Define Paths

```python
zip_path = '/content/drive/MyDrive/Dataset/combined.zip'  # Update this to the path of your ZIP file
extract_path = '/content/drive/MyDrive/Dataset'  # Define where you want to extract the files
```

##### Step 3: Unzip the Dataset

```python
import zipfile
import os

# Check if the extraction path exists, if not, create it
if not os.path.exists(extract_path):
    os.makedirs(extract_path)

# Extract the ZIP file
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(extract_path)
```

##### Step 4: Verify Extracted Files

```python
print(os.listdir(extract_path))  # List the contents of the extracted dataset
```

##### Step 5: Ensure your dataset is correctly placed in Google Drive

```python
dataset_path = "content/drive/MyDrive/Dataset/combined"
```

##### Step 6: Ensure data.yaml is Present

After extraction, check if `data.yaml` is present in the `Dataset/combined` folder in `MyDrive`. If not, manually place the `data.yaml` file from the repository into the `Dataset/combined` folder.

### 2. Clone YOLOv5 Repository

```
!git clone https://github.com/ultralytics/yolov5.git
```

### 3. Replace Modified Files

After cloning, replace the following files in the `yolov5` directory with the modified versions present in the repository's `yolov5` directory:

- `benchmarks.py`
- `detect.py`
- `train.py`
- `export.py`

### 4. Train

- Ensure that training and validation commands are run after unzipping the dataset. These commands are present in the provided Jupyter Notebook.
- Execute the following command to start training:
    ```bash
    !python /content/yolov5/train.py --img 640 --batch 16 --epochs 30 --data /content/drive/MyDrive/Dataset/combined/data.yaml --weights yolov5s.pt --device 0
    ```

### 5. Validate

- Ensure that training and validation commands are run after unzipping the dataset. These commands are present in the provided Jupyter Notebook.
- Run the following command to validate the trained model:
    ```bash
    !python /content/yolov5/val.py --img 640 --data /content/drive/MyDrive/Dataset/combined/data.yaml --weights /content/yolov5/runs/train/exp2/weights/best.pt --device 0
    ```

### 6. Save the Model

- Once training is completed, save the trained model in Google Drive using the following command (provided in jupyter notebook):
    ```bash
    !cp /content/yolov5/runs/train/exp2/weights/best.pt /content/drive/MyDrive/Dataset/model.pt
    ```

### 7. Access Results

- Navigate to `/content/yolov5/runs/train/exp2/` to access trained weights, logs, and other results.

## Running the Frontend UI

To test the trained model, you can run the frontend UI provided in `frontend.py`. Follow these steps to set up and run the Streamlit-based UI:

##### 1. Install Required Dependencies

Ensure you have Streamlit and any necessary libraries installed:
```bash
pip install streamlit torch torchvision
```

##### 2. Run the Frontend UI

Execute the following command to start the UI:
```bash
streamlit run frontend.py
```

##### 3. Upload Model and Test Images
- Ensure that two folders, namely `data` and `models`, exist in the same directory as `frontend.py`.
- A default model, as provided in the repository, should be included.
- Additionally, include 2-3 sample images in `sample_images` subfolder within `data` folder as required in the code.
- Create a subfolder named `uploaded_data` within the `data` folder.
- You can upload your trained YOLOv5 model (`.pt` file - which is saved in the `Dataset` folder `in MyDrive`) via the sidebar in the Streamlit UI.
- Upload an image or select a sample image for inference.
- The UI will display the detected objects and their count.

##### 4. Model Configuration
- The UI allows selecting a pre-trained YOLOv5 model or uploading a custom-trained model.
- Confidence thresholds can be adjusted through the sidebar settings.
- Results are displayed alongside the input images.

##### 5. Hazardous Items Detection
- The UI highlights detected hazardous items (e.g., bulbs, batteries, mobiles, laptops) in red.
- Users receive disposal recommendations for hazardous items.

## Notes

- Follow the Jupyter Notebook step by step to ensure smooth execution.
- Ensure GPU runtime (T4) is enabled for faster training.
- If any errors occur, verify dataset placement and file replacements.
- You can train the model on your custom dataset by following these steps:
    - Update dataset labels using the `label_update.py` script provided in this repository.
    - Calculate class weights using the `weights.py` script and update `data.yaml` accordingly.
    - You can download datasets from [Roboflow Universe](https://universe.roboflow.com/) and customize them.
