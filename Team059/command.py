import ctypes
import os
import random
import pyttsx3
import speech_recognition as sr
import eel
import time
import openai
import sys
import sympy as sp
import eel

@eel.expose
def speak(text):
    text = str(text)
    engine = pyttsx3.init('sapi5')
    voices = engine.getProperty('voices') 
    engine.setProperty('voice', voices[0].id)
    engine.setProperty('rate', 174)
    eel.DisplayMessage(text)()
    engine.say(text)
    eel.receiverText(text)
    engine.runAndWait()


# Function to solve equations
@eel.expose
def solve_equation(equation):
    try:
        # Parse the equation entered by the user
        equation = equation.replace('^', '**')  # Replace '^' with '**' for exponentiation
        lhs, rhs = equation.split("=")  # Split equation into LHS and RHS
        lhs = sp.sympify(lhs)  # Convert LHS to sympy expression
        rhs = sp.sympify(rhs)  # Convert RHS to sympy expression
        
        # Solve the equation
        solution = sp.solve(lhs - rhs)  # Solve the equation (lhs = rhs)
        
        # Format the solution
        if solution:
            result = f"The solution is: {solution}"
        else:
            result = "No solution found."
        
        eel.DisplayMessage(result)()  # Display the result in the frontend
        return result  # Return the result
    except Exception as e:
        eel.DisplayMessage(f"Error solving equation: {str(e)}")()
        return f"Error: {str(e)}"





@eel.expose
def takecommand():
    r = sr.Recognizer()

    with sr.Microphone() as source:
        print('Listening...')
        eel.DisplayMessage('Listening...')()  # Display message for listening
        r.pause_threshold = 1
        r.adjust_for_ambient_noise(source)
        r.energy_threshold = 4000  # Adjust energy threshold if needed

        try:
            # Listen for audio for a limited time
            audio = r.listen(source, timeout=10, phrase_time_limit=5)
        except sr.WaitTimeoutError:
            print("Listening timed out.")
            eel.DisplayMessage('Listening timed out. Please try again.')()
            return ""
        except Exception as e:
            print(f"Error listening: {e}")
            return ""

    try:
        print('Recognizing...')
        eel.DisplayMessage('Recognizing...')()  # Display message for recognition
        query = r.recognize_google(audio, language='en-in')
        print(f"User said: {query}")
        eel.DisplayMessage(query)()  # Show recognized text
        return query.lower()

    except Exception as e:
        print(f"Error recognizing: {e}")
        eel.DisplayMessage(f'Error: {e}')()
        return ""



    except sr.UnknownValueError:
        print("Sorry, I couldn't understand the audio.")
        eel.DisplayMessage("Sorry, I couldn't understand the audio.")()
        return ""
    except sr.RequestError:
        print("Could not request results from Google Speech Recognition service.")
        eel.DisplayMessage("Error with the speech recognition service.")()
        return ""
@eel.expose
def allCommands(message=1):
    print(f"Message received from frontend: {message}")
    if message == 1:
        query = takecommand()
        print(query)
    elif "open" in message:
        from engine.features import openCommand
        openCommand(message)
        eel.ShowHood()
    elif "weather condition" in message:
        from engine.features import getWeather
    
        getWeather(message)
        eel.ShowHood()
    elif "change background" in message or "change wallpaper" in message:
        img = r"C:/Users/yukkt/Downloads/images"  # Ensure correct path
        list_img = [file for file in os.listdir(img) if file.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif'))]
        
        if list_img:  # Check if images are available
            imgChoice = random.choice(list_img)
            randomImg = os.path.join(img, imgChoice)
            randomImg = os.path.abspath(randomImg)  # Absolute path of the image
            
            SPI_SETDESKWALLPAPER = 20  # Constant for changing wallpaper
            result = ctypes.windll.user32.SystemParametersInfoW(SPI_SETDESKWALLPAPER, 0, randomImg, 0)
            
            if result:  # Check if the wallpaper change was successful
                speak("Background changed successfully")
            else:
                speak("Failed to change background. Please try again.")
        else:
            speak("No images found in the specified directory.")
    elif "send message" in message or "phone call" in message or "video call" in message:
            from engine.features import findContact, whatsApp, makeCall, sendMessage
            contact_no, name = findContact(message)
            if(contact_no != 0):
                speak("Which mode you want to use whatsapp or mobile")
                preferance = takecommand()
                print(preferance)

                if "mobile" in preferance:
                    if "send message" in message or "send sms" in message: 
                        speak("what message to send")
                        message_type= takecommand()
                        sendMessage(message_type, contact_no, name)
                    elif "phone call" in message:
                        makeCall(name, contact_no)
                    else:
                        speak("please try again")
                elif "whatsapp" in preferance:
                    message_type= ""
                    if "send message" in message:
                        message_type= 'message'
                        speak("what message to send")
                        message= takecommand()
                                        
                    elif "phone call" in message:
                        message_type= 'call'
                    else:
                        message_type= 'video call'
                                        
                    whatsApp(contact_no, message, message_type, name)
    elif "on youtube" in message.lower():  # Check if 'on youtube' is part of the query
            print("youtube")
            from engine.features import PlayYoutube
            PlayYoutube(message)

    elif "solve equation" in message.lower():  
        equation = message.replace("solve equation", "").strip()  # Remove the trigger phrase from the input
        if equation:
            solution = solve_equation(equation)  # Solve the equation
            speak(f"Here is the solution: {solution}")  # Provide the solution to the user
        else:
            speak("You need to provide an equation to solve.")

    else:
            print("No conditions matched, executing else block.")
            from engine.features import chatBot
            chatBot(message)
        
    try:
        query=takecommand()
        print(query)
        if "open" in query:
            from engine.features import openCommand
            openCommand(query)

        elif "on youtube" in query.lower():  # Check if 'on youtube' is part of the query
            print("youtube")
            from engine.features import PlayYoutube
            PlayYoutube(query)

            
        elif "send message" in query or "phone call" in query or "video call" in query:
            from engine.features import findContact, whatsApp, makeCall, sendMessage
            contact_no, name = findContact(query)
            if(contact_no != 0):
                speak("Which mode you want to use whatsapp or mobile")
                preferance = takecommand()
                print(preferance)

                if "mobile" in preferance:
                    if "send message" in query or "send sms" in query: 
                        speak("what message to send")
                        message = takecommand()
                        sendMessage(message, contact_no, name)
                    elif "phone call" in query:
                        makeCall(name, contact_no)
                    else:
                        speak("please try again")
                elif "whatsapp" in preferance:
                    message = ""
                    if "send message" in query:
                        message = 'message'
                        speak("what message to send")
                        query = takecommand()
                                        
                    elif "phone call" in query:
                        message = 'call'
                    else:
                        message = 'video call'
                                        
                    whatsApp(contact_no, query, message, name)
        
        elif "change background" in query or "change wallpaper" in query:
          img = r"C:/Users/yukkt/Downloads/images"  # Ensure correct path
          list_img = [file for file in os.listdir(img) if file.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif'))]
        
          if list_img:  # Check if images are available
            imgChoice = random.choice(list_img)
            randomImg = os.path.join(img, imgChoice)
            randomImg = os.path.abspath(randomImg)  # Absolute path of the image
            
            SPI_SETDESKWALLPAPER = 20  # Constant for changing wallpaper
            result = ctypes.windll.user32.SystemParametersInfoW(SPI_SETDESKWALLPAPER, 0, randomImg, 0)
            
            if result:  # Check if the wallpaper change was successful
                speak("Background changed successfully")
            else:
                speak("Failed to change background. Please try again.")
    
        elif "weather condition" in query:
            from engine.features import getWeather
    
            getWeather(query)

        else:
            print("No conditions matched, executing else block.")
            from engine.features import chatBot
            chatBot(query)
        
    except:
        print("error")

    eel.ShowHood()
