import urllib.request
import urllib.error

req = urllib.request.Request(
    'https://ai-career-guide-odjt.onrender.com/api/v1/auth/register',
    method='OPTIONS',
    headers={
        'Origin': 'https://ai-career-guide-rho.vercel.app',
        'Access-Control-Request-Method': 'POST'
    }
)

try:
    res = urllib.request.urlopen(req)
    print("Status:", res.status, res.reason)
    print("Headers:", res.headers)
except urllib.error.HTTPError as e:
    print("Error:", e.code, e.reason)
    print("Headers:", e.headers)
