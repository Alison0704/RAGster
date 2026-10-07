FROM python:3.12-slim-bookworm

# Icarus Verilog compiles and simulates; GTKWave displays the waveform on the host's XQuartz.
RUN apt-get update \
 && apt-get install -y --no-install-recommends iverilog gtkwave fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Student code runs as an unprivileged user.
RUN useradd --create-home sim
USER sim
WORKDIR /app
COPY server.py .

EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
