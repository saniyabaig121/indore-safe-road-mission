import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace hardcoded fetch URLs with relative ones
html = html.replace("fetch('http://localhost:8001/api/", "fetch('/api/")
html = html.replace("fetch(`http://localhost:8001/api/", "fetch(`/api/")

# Replace WebSocket URL with dynamic one
old_ws = "const ws = new WebSocket('ws://localhost:8001/ws');"
new_ws = "const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';\n    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);"
html = html.replace(old_ws, new_ws)

# Also fix the network error alert message
html = html.replace("alert('Network error. Is the backend running on port 8001?');", "alert('Network error. Is the backend running?');")

with open('index.html', 'w', encoding='utf-8') as out:
    out.write(html)
print("Updated index.html for production!")
