FROM node:18

# Install Python and pip for Slither
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and scripts
COPY package*.json ./
COPY scripts/ ./scripts/

# Install Node.js dependencies without running postinstall
RUN npm ci --ignore-scripts

# Copy the rest of the source code (including TypeScript files)
COPY . .

# Now manually run the install-slither script and build
RUN npm run install-slither && npm run build

# Expose the port (Railway will set PORT environment variable)
EXPOSE ${PORT:-3000}

# Start the application
CMD ["npm", "start"]
