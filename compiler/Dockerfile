# Step 1: Use a base Linux image
FROM ubuntu:22.04

# Step 2: Set environment variables to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Step 3: Update package lists and install necessary tools
# We install curl first, which is needed to download the Node.js setup script.
RUN apt-get update && \
    apt-get install -y curl build-essential python3 default-jdk && \
    apt-get clean

# --- FIX: Install a modern version of Node.js ---
# This uses the official setup script from NodeSource to add the repository for Node.js 18.
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
# Now, when we install nodejs, we get the modern version.
RUN apt-get install -y nodejs

# Step 4: Set the working directory inside the container
WORKDIR /app

# Step 5: Copy package.json and package-lock.json
COPY package*.json ./

# Step 6: Install Node.js dependencies
RUN npm install

# Step 7: Copy the rest of the microservice's source code
COPY . .

# Step 8: Expose the port the compiler service runs on
EXPOSE 5001

# Step 9: Define the command to run the application
CMD [ "node", "index.js" ]
