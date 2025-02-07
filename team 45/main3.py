import requests
from bs4 import BeautifulSoup

a = requests.get('https://en.wikipedia.org/wiki/Lionel_Messi')
print(a.text[0])

soup = BeautifulSoup(a.text,'html.parser')
print(soup.find("h1").text)