FROM node:18

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 python3-pip python3-venv build-essential \
    curl git && \
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
    rm -rf /tmp/circom

# Verify Circom installation
RUN . /root/.cargo/env && circom --version

# Try to install Circomspect (but don't fail the build if it doesn't work)
RUN . /root/.cargo/env && \
    (cargo install circomspect || echo "Circomspect installation failed, continuing without it")

# Create Python venv and install Slither
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install slither-analyzer

# Add paths
ENV PATH="/opt/venv/bin:/root/.cargo/bin:$PATH"

WORKDIR /app

# Copy and build
COPY . .
RUN npm install && npm run build

EXPOSE ${PORT:-3000}
CMD ["npm", "start"]
