FROM node:18

# Install Python and pip for Slither (with verbose output)
RUN echo "📦 Installing system dependencies..." && \
    apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    build-essential && \
    rm -rf /var/lib/apt/lists/* && \
    echo "✅ System dependencies installed"

# Verify Python installation
RUN echo "🔍 Verifying Python installation..." && \
    python3 --version && \
    pip3 --version && \
    echo "✅ Python verification complete"

# Create a virtual environment for Python packages
RUN echo "🔧 Creating Python virtual environment..." && \
    python3 -m venv /opt/venv && \
    echo "✅ Virtual environment created"

# Add venv to PATH
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy package.json and install Node dependencies first
COPY package*.json ./
RUN echo "📦 Installing Node.js dependencies..." && \
    npm install && \
    echo "✅ Node.js dependencies installed"

# Copy scripts directory
COPY scripts/ ./scripts/

# Install Slither with verbose output in the virtual environment
RUN echo "🔧 Installing Slither..." && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install slither-analyzer && \
    echo "✅ Slither installation complete" && \
    /opt/venv/bin/slither --version && \
    echo "✅ Slither verification complete"

# Copy all source files
COPY . .

# Build the TypeScript project
RUN echo "🔨 Building TypeScript..." && \
    npm run build && \
    echo "✅ Build complete"

# Expose port
EXPOSE ${PORT:-3000}

# Start the application
CMD ["npm", "start"]
