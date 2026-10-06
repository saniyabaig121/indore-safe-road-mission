with open('app.py', 'r', encoding='utf-8') as f:
    code = f.read()

injection = """
from fastapi.responses import FileResponse

@app.get("/")
def serve_frontend():
    import os
    # Serve the index.html from the frontend directory
    frontend_path = os.path.join("..", "frontend", "index.html")
    return FileResponse(frontend_path)
"""
code = code.replace('app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")', 'app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")\n' + injection)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(code)
print("app.py updated to serve frontend")
