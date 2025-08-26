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

# Copy package files first (for better Docker layer caching)
COPY package*.json ./
COPY scripts/ ./scripts/

# Install Node.js dependencies
# This will run postinstall script which installs Slither and builds the project
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the port (Railway will set PORT environment variable)
EXPOSE ${PORT:-3000}

# Start the application
CMD ["npm", "start"]
