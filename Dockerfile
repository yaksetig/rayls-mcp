FROM node:18

# Install Python and pip for Slither
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

# Create a virtual environment for Python packages
RUN python3 -m venv /opt/venv

# Add venv to PATH
ENV PATH="/opt/venv/bin:$PATH"

# Install Slither in the virtual environment
RUN /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install slither-analyzer

WORKDIR /app

# Copy all source files
COPY . .

# Install Node dependencies and build
RUN npm install && npm run build

EXPOSE ${PORT:-3000}
CMD ["npm", "start"]
