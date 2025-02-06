import numpy as np
import pickle as pkl
import tensorflow as tf
from tensorflow.keras.applications.resnet50 import ResNet50,preprocess_input
from tensorflow.keras.preprocessing import image
from tensorflow.keras.layers import GlobalMaxPool2D
from sklearn.neighbors import NearestNeighbors
import os
from numpy.linalg import norm
import streamlit as st


st.header('Fashion recommendation system')
if st.button("Return to search"):
    new_url = "http://127.0.0.1:8000/home/"  
    st.markdown(f'[Go to search Page]({new_url})', unsafe_allow_html=True)


img_features = pkl.load(open('img_features.pkl','rb'))

filenames = pkl.load(open('filenames.pkl','rb'))

#function to extract image features
def extract_features(images_path,model):
    img = image.load_img(images_path,target_size=(224,224))
    img_array = image.img_to_array(img)
    img_expand_dim = np.expand_dims(img_array,axis=0)
    img_preprocess = preprocess_input(img_expand_dim)
    result = model.predict(img_preprocess).flatten()
    norm_res = result / norm(result)
    return norm_res

#importing model
model = ResNet50(weights = 'imagenet', include_top=False, input_shape=(224,224,3))
model.trainable =False
model = tf.keras.models.Sequential([model,GlobalMaxPool2D()])

neighbors = NearestNeighbors(n_neighbors=6, algorithm='brute', metric='euclidean')
neighbors.fit(img_features)

upload_file = st.file_uploader("Upload an image")
if upload_file is not None:
    with open(os.path.join('upload',upload_file.name),'wb') as f:
        f.write(upload_file.getbuffer())
    st.subheader('Uploaded image')
    st.image(upload_file, width=150)  

    img_fet = extract_features(upload_file, model)
    distance,indices = neighbors.kneighbors([img_fet])
    st.subheader('Recommended image')
    c1,c2,c3,c4,c5 = st.columns(5)

    with c1:
        st.image(filenames[indices[0][1]], width=250)  # Adjust width as needed

    with c2:
        st.image(filenames[indices[0][2]], width=250)  # Adjust width as needed

    with c3:
        st.image(filenames[indices[0][3]], width=250)  # Adjust width as needed

    with c4:
        st.image(filenames[indices[0][4]], width=250)  # Adjust width as needed

    with c5:
        st.image(filenames[indices[0][5]], width=250)  # Adjust width as needed

   
       



    


