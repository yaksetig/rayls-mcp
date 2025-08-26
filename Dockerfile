FROM node:18

# Install system dependencies for Python, Rust, and build tools
RUN echo "📦 Installing system dependencies..." && \
    apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    curl \
    git && \
    rm -rf /var/lib/apt/lists/* && \
    echo "✅ System dependencies installed"

# Install Rust (required for Circom)
RUN echo "🦀 Installing Rust..." && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    echo "✅ Rust installation complete"

# Add Rust to PATH
ENV PATH="/root/.cargo/bin:$PATH"

# Verify Rust installation and install Circom
RUN echo "🔧 Installing Circom..." && \
    . /root/.cargo/env && \
    rustc --version && \
    cargo --version && \
    git clone https://github.com/iden3/circom.git /tmp/circom && \
    cd /tmp/circom && \
    cargo build --release && \
    cargo install --path circom && \
    rm -rf /tmp/circom && \
    circom --version && \
    echo "✅ Circom installation complete"

# Create Python virtual environment for Slither
RUN echo "🐍 Creating Python virtual environment..." && \
    python3 -m venv /opt/venv && \
    echo "✅ Virtual environment created"

# Add venv to PATH
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy package.json and install Node dependencies first
COPY package.json ./
RUN echo "📦 Installing Node.js dependencies..." && \
    echo "Current directory contents:" && \
    ls -la && \
    echo "Package.json contents:" && \
    cat package.json && \
    npm install --verbose && \
    echo "✅ Node.js dependencies installed"

# Copy ALL source files (including scripts directory)
COPY . .

# Install Slither with verbose output in the virtual environment
RUN echo "🔧 Installing Slither..." && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install slither-analyzer && \
    echo "✅ Slither installation complete" && \
    /opt/venv/bin/slither --version && \
    echo "✅ Slither verification complete"

# Build the TypeScript project
RUN echo "🔨 Building TypeScript..." && \
    npm run build && \
    echo "✅ Build complete"

# Expose port
EXPOSE ${PORT:-3000}

# Start the application
CMD ["npm", "start"]
