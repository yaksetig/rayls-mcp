FROM node:18

# Install system dependencies for Python and Rust
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    build-essential \
    curl \
    git && \
    rm -rf /var/lib/apt/lists/*

# Install Rust for Circom
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:$PATH"

# Install Circom
RUN . /root/.cargo/env && \
    git clone https://github.com/iden3/circom.git /tmp/circom && \
    cd /tmp/circom && \
    cargo build --release && \
    cargo install --path circom && \
    rm -rf /tmp/circom && \
    circom --version

# Install circomspect (try cargo install first, fallback to source)
RUN . /root/.cargo/env && \
    (cargo install circomspect || \
     (echo "Cargo install failed, trying from source..." && \
      git clone https://github.com/trailofbits/circomspect.git /tmp/circomspect && \
      cd /tmp/circomspect && \
      cargo build --release && \
      cargo install --path . && \
      rm -rf /tmp/circomspect)) && \
    circomspect --version

# Create Python virtual environment and install Slither  
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install slither-analyzer

# Add both paths to environment
ENV PATH="/opt/venv/bin:/root/.cargo/bin:$PATH"

WORKDIR /app

# Copy all source files
COPY . .

# Install Node dependencies and build
RUN npm install && npm run build

EXPOSE ${PORT:-3000}
CMD ["npm", "start"]
