import os
import eel
import subprocess

from engine.features import *
from engine.command import *
from engine.auth import recoganize

def start():
    eel.init("www")  # Initialize Eel with the 'www' directory

    # Optional: Open the browser before starting the eel server
    try:
        os.startfile('http://localhost:8000/index.html')  # Open in default browser (or Edge)
    except Exception as e:
        print(f"Error opening browser: {e}")

    playAssistantSound()

    @eel.expose
    def init():
        subprocess.call([r'device.bat'])
        eel.hideLoader()
        speak("Ready for Face Authentication")
        
        flag = recoganize.AuthenticateFace()
        if flag == 1:
            eel.hideFaceAuth()
            speak("Face Authentication Successful")
            eel.hideFaceAuthSuccess()
            speak("Hello, Welcome, How can I Help You")
            eel.hideStart()
            playAssistantSound()
        else:
            speak("Face Authentication Fail")
    
    # Start the eel server (blocks until the server is stopped)
    eel.start('index.html', mode=None, host='localhost', block=True)

if __name__ == "__main__":
    start()
