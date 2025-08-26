FROM node:18

# Install Python and pip for Slither
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies (this will install Slither via postinstall)
RUN npm install

# Build the project
RUN npm run build

EXPOSE ${PORT:-3000}
CMD ["npm", "start"]
