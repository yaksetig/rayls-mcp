FROM node:18

# Install Python and pip for Slither
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv build-essential && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install slither-analyzer && \
    rm -rf /var/lib/apt/lists/*

# Add venv to PATH
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy everything and install
COPY . .
RUN npm install && npm run build

EXPOSE ${PORT:-3000}
CMD ["npm", "start"]
