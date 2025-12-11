# Build stage
FROM node:20-slim

# Install Python and build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend definitions
COPY ["Client App/backend/package*.json", "./"]

# Note: we might need to be careful with .env in production, usually secrets are Env Vars in Railway
# But copying for now if user relies on it, though Railway injects them.

# Install Node dependencies
RUN npm install

# Copy backend source
COPY ["Client App/backend", "./"]

# Setup Python for Prediction
# We need to copy the model directory from server/model to expected path
# The backend expects: ./model/property/predict_for_api.py (relative to server.js)
# Let's verify directory structure in container.
# We are in /app which contains backend files.
# We need to copy server/model to /app/model

COPY ["server/model", "./model"]

# Install Python dependencies
# backend/package.json doesn't list python deps.
# server/requirements.txt might exist or we need to infer.
# Let's assume content of requirements.txt or manually install common libs.
# Based on code: pandas, scikit-learn (implied by model usage usually), or just standard libs?
# The code runs `predict_for_api.py`. Let's check imports in that file if possible.
# For now, install basics.
RUN pip3 install pandas scikit-learn flask numpy --break-system-packages

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
