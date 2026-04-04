import urllib.request
import urllib.error

req = urllib.request.Request(
    'https://ai-career-guide-odjt.onrender.com/api/v1/jobs',
    method='OPTIONS',
    headers={
        'Origin': 'https://ai-career-guide-rho.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
    }
)

try:
    res = urllib.request.urlopen(req)
    print("OPTIONS Status:", res.status, res.reason)
    print("OPTIONS Headers:", res.headers)
except urllib.error.HTTPError as e:
    print("OPTIONS Error:", e.code, e.reason)
    print("OPTIONS Headers:", e.headers)

req2 = urllib.request.Request(
    'https://ai-career-guide-odjt.onrender.com/api/v1/jobs',
    method='GET',
    headers={
        'Origin': 'https://ai-career-guide-rho.vercel.app'
    }
)

try:
    res2 = urllib.request.urlopen(req2)
    print("GET Status:", res2.status, res2.reason)
    print("GET Headers:", res2.headers)
except urllib.error.HTTPError as e:
    print("GET Error:", e.code, e.reason)
    print("GET Headers:", e.headers)
