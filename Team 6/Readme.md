# Enhancing Image Captioning with Vision-Language Models for Better Multimodal Insights
A deep learning project that combines BLIP-2, DeepFace, and Google's Gemini model to generate rich image captions with emotional context.

## Overview

This project creates an advanced image captioning system that:
1. Generates base captions using BLIP-2
2. Detects emotions in images using DeepFace
3. Enhances captions using Google's Gemini model
4. Provides audio output of captions using gTTS
5. Offers a user-friendly Gradio interface

## Features

- **Base Caption Generation**: Uses BLIP-2 (2.7B parameters) for initial image captioning
- **Emotion Detection**: Integrates DeepFace for facial emotion recognition
- **Caption Enhancement**: Utilizes Gemini 1.5 Flash for context-aware caption refinement
- **Performance Metrics**: Includes BLEU, METEOR, and ROUGE score calculations
- **Audio Generation**: Converts captions to speech using Google Text-to-Speech
- **Interactive UI**: Built with Gradio for easy interaction

## Requirements

```
tensorflow==2.15.1
transformers
torch
torchvision
bitsandbytes
deepface
opencv-python
nltk
rouge-score
pycocoevalcap
google-generativeai
gradio
gtts
```

## Installation

1. Set up API keys:
- Get a Google API key for Gemini
- Configure Kaggle credentials for dataset download

## Usage

1. Launch the Gradio interface:
```python
python main.py
```

2. Access the web interface at `http://localhost:7860`

3. Upload an image to:
- Generate basic captions
- Detect emotions
- Create enhanced captions
- Generate audio versions

## Model Architecture

- **Image Captioning**: BLIP-2 with OPT-2.7B
- **Emotion Detection**: DeepFace with Haar Cascade Classifier
- **Caption Enhancement**: Gemini 1.5 Flash
- **Audio Generation**: Google Text-to-Speech (gTTS)

## Performance Metrics

The system evaluates captions using:
- BLEU Score
- METEOR Score
- ROUGE Score

Comparative analysis shows improved scores for enhanced captions over base captions.


```

