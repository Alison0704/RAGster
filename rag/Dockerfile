FROM python:3.12-slim-bookworm

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

RUN useradd --create-home rag
USER rag
WORKDIR /app
COPY app ./app
COPY tests ./tests
COPY pytest.ini .
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8002
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
