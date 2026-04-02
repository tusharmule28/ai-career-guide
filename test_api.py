import urllib.request
try:
    res = urllib.request.urlopen('https://ai-career-guide-odjt.onrender.com/api/v1/debug-cors')
    print(res.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
