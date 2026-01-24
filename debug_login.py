import urllib.request
import urllib.error
import json

BASE_URL = "http://127.0.0.1:5000/api"

def test_login():
    print("Testing Login...")
    url = f"{BASE_URL}/login"
    payload = json.dumps({"email": "admin@example.com", "password": "admin123"}).encode('utf-8')
    headers = {"Content-Type": "application/json"}
    
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            print(f"Login Status: {status}")
            data = json.loads(response.read().decode('utf-8'))
            token = data.get("access_token")
            print(f"Token received: {token[:20]}...")
            return token
    except urllib.error.HTTPError as e:
        print(f"Login Failed: {e.code} {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        print(f"Login Exception: {e}")
        return None

def test_me(token):
    print("\nTesting /api/me...")
    url = f"{BASE_URL}/me"
    headers = {"Authorization": f"Bearer {token}"}
    
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            print(f"Me Status: {status}")
            print(f"Me Response: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"Me Failed: {e.code} {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Me Exception: {e}")

if __name__ == "__main__":
    token = test_login()
    if token:
        test_me(token)
