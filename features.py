import os
from pipes import quote
import re
import sqlite3
import struct
import subprocess
import time
import webbrowser
from fpdf import FPDF
from playsound import playsound
import eel
import pyaudio
import pyautogui
from engine.command import speak, takecommand
from engine.config import ASSISTANT_NAME
# Playing assiatnt sound function
import pywhatkit as kit
import pvporcupine
import numpy as np
from engine.helper import extract_yt_term, remove_words
from hugchat import hugchat
con = sqlite3.connect("jarvis.db")
cursor = con.cursor()

@eel.expose
def playAssistantSound():
    music_dir = "www\\assets\\audio\\start_sound.mp3"
    playsound(music_dir)
import requests
def getWeather(query):
    api_key = "f661480d987feac4ef21e0e009f0e320"
    cities = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Pune", "Jaipur", "Ahmedabad", "Lucknow"]
    location = None
    for city in cities:
        if city.lower() in query.lower():
            location = city
            break
    
    if not location:
        speak("Please specify the city name to get the weather information.")
        return
    
    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
    
    try:
        response = requests.get(url).json()
    except requests.exceptions.RequestException as e:
        speak("Network issue, please check your internet connection.")
        print(e)
        return
    print(response)
    if response.get('cod') != 200:
        speak(f"Could not fetch weather for {location}. Reason: {response.get('message', 'Unknown error')}")
    else:
        temp = response['main']['temp']
        description = response['weather'][0]['description']
        speak(f"The temperature in {location} is {temp}°C with {description}") 
def openCommand(query):
    query = query.replace(ASSISTANT_NAME, "")
    query = query.replace("open", "")
    query.lower()
    app_name = query.strip()

    if app_name != "":

        try:
            cursor.execute(
                'SELECT path FROM sys_command WHERE name IN (?)', (app_name,))
            results = cursor.fetchall()

            if len(results) != 0:
                speak("Opening "+query)
                os.startfile(results[0][0])

            elif len(results) == 0: 
                cursor.execute(
                'SELECT url FROM web_command WHERE name IN (?)', (app_name,))
                results = cursor.fetchall()
                
                if len(results) != 0:
                    speak("Opening "+query)
                    webbrowser.open(results[0][0])

                else:
                    speak("Opening "+query)
                    try:
                        os.system('start '+query)
                    except:
                        speak("not found")
        except:
            speak("some thing went wrong")
def PlayYoutube(query):
    search_term = extract_yt_term(query)
    
    if search_term:
        speak("Playing " + search_term + " on YouTube")
        kit.playonyt(search_term)
    else:
        speak("I couldn't understand what you want to play on YouTube.")
def hotword():
    porcupine = None
    paud = None
    audio_stream = None
    try:
        # pre trained keywords    
        porcupine = pvporcupine.create(keywords=["jarvis","alexa"]) 
        paud = pyaudio.PyAudio()
        audio_stream = paud.open(
            rate=porcupine.sample_rate,
            channels=1,
            format=pyaudio.paInt16,
            input=True,
            frames_per_buffer=porcupine.frame_length
        )
        
        print("Listening for hotword...")
        while True:
            keyword = audio_stream.read(porcupine.frame_length)
            keyword = np.frombuffer(keyword, dtype=np.int16)

            # processing keyword comes from mic 
            keyword_index = porcupine.process(keyword)

            print(f"Keyword Index: {keyword_index}")  # Debug statement

            # checking if a keyword is detected
            if keyword_index >= 0:
                print("Hotword detected!")
                
                # pressing shortcut key win+j
                pyautogui.keyDown("win")
                pyautogui.press("j")
                time.sleep(0.2)
                pyautogui.keyUp("win")
                
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        if porcupine is not None:
            porcupine.delete()
        if audio_stream is not None:
            audio_stream.close()
        if paud is not None:
            paud.terminate()
# find contacts
def findContact(query):
    
    words_to_remove = [ASSISTANT_NAME, 'make', 'a', 'to', 'phone', 'call', 'send', 'message', 'wahtsapp', 'video']
    query = remove_words(query, words_to_remove)

    try:
        query = query.strip().lower()
        cursor.execute("SELECT mobile_no FROM contacts WHERE LOWER(name) LIKE ? OR LOWER(name) LIKE ?", ('%' + query + '%', query + '%'))
        results = cursor.fetchall()
        print(results[0][0])
        mobile_number_str = str(results[0][0])

        if not mobile_number_str.startswith('+91'):
            mobile_number_str = '+91' + mobile_number_str

        return mobile_number_str, query
    except:
        speak('not exist in contacts')
        eel.ShowHood()
        return 0, 0   
try:
  def whatsApp(mobile_no, message, flag, name):
    if flag == 'message':
        target_tab =19
        jarvis_message = "message send successfully to "+name
        eel.ShowHood()

    elif flag == 'call':
        target_tab=14
        message = ''
        jarvis_message = "calling to "+name
        eel.ShowHood()

    else:
        target_tab = 13
        message = ''
        jarvis_message = "staring video call with "+name
        eel.ShowHood()


    # Encode the message for URL
    encoded_message = quote(message)
    print(encoded_message)
    whatsapp_url = f"whatsapp://send?phone={mobile_no}&text={encoded_message}"

    # Construct the full command
    full_command = f'start "" "{whatsapp_url}"'

    # Open WhatsApp with the constructed URL using cmd.exe
    subprocess.run(full_command, shell=True)
    time.sleep(5)
    subprocess.run(full_command, shell=True)
    pyautogui.hotkey('ctrl', 'f')

    for i in range(1, target_tab):
        pyautogui.hotkey('tab')

    pyautogui.hotkey('enter')
    speak(jarvis_message)
except:
    speak("Not Valid") 
cached_responses = {}
all_responses = []
from reportlab.pdfgen import canvas
def save_responses_to_pdf(filename="chat_responses.pdf"):
    """Saves all chatbot responses to a PDF file."""
    c = canvas.Canvas(filename)
    c.setFont("Helvetica", 12)

    y_position = 800  # Start position for text
    for i, chat in enumerate(all_responses):
        question = f"Q{i+1}: {chat['question']}"
        response = f"A{i+1}: {chat['response']}"

        c.drawString(50, y_position, question)
        y_position -= 20  # Move down for response
        c.drawString(50, y_position, response)
        y_position -= 30  # Space between Q&A

        if y_position < 50:  # If page is full, add a new page
            c.showPage()
            c.setFont("Helvetica", 12)
            y_position = 800  # Reset position

    c.save()
import g4f
cached_responses = {}
all_responses = []
def chatBot(query):
    user_input = query.lower()
    if user_input in cached_responses:
        return cached_responses[user_input]
    try:
        response = g4f.ChatCompletion.create(
            model=g4f.models.default, 
            messages=[{"role": "user", "content": user_input}]
        )
    except Exception as e:
        response = f"An error occurred: {str(e)}"

    cached_responses[user_input] = response

    all_responses.append({
        'question':query,
        'response':response
    })
    save_responses_to_pdf()
    speak(response)
    return response
def makeCall(name, mobileNo):
    mobileNo =mobileNo.replace(" ", "")
    speak("Calling "+name)
    command = 'adb shell am start -a android.intent.action.CALL -d tel:'+mobileNo
    os.system(command)
def sendMessage(message, mobileNo, name):
    from engine.helper import replace_spaces_with_percent_s, goback, keyEvent, tapEvents, adbInput
    message = replace_spaces_with_percent_s(message)
    mobileNo = replace_spaces_with_percent_s(mobileNo)
    speak("sending message")
    goback(4)
    time.sleep(1)
    keyEvent(3)
    # open sms app
    tapEvents(540, 480)
    #start chat
    tapEvents(540, 2100)
    # search mobile no
    adbInput(mobileNo)
    #tap on name
    tapEvents(540, 750)
    # tap on input
    tapEvents(540, 2200)
    #message
    adbInput(message)
    #send
    tapEvents(900, 2300)
    speak("message send successfully to "+name)

