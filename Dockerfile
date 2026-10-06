FROM python:3.10

WORKDIR /code

# Copy the backend requirements and install them
COPY ./backend/requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the entire project
COPY . .

# Change directory to backend and run FastAPI on port 7860 (HuggingFace default)
WORKDIR /code/backend
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
