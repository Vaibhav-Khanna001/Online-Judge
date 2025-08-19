# Step 1: Use an official Node.js runtime as a parent image
# We're using Node.js version 18, which is a stable Long-Term Support (LTS) version.
FROM node:18-alpine

# Step 2: Set the working directory inside the container
# This is where our application code will live.
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to the working directory
# We copy these first to take advantage of Docker's layer caching.
# If these files don't change, Docker won't re-run 'npm install' on subsequent builds, making them much faster.
COPY package*.json ./

# Step 4: Install application dependencies
# This command reads the package.json and installs all the required npm packages.
RUN npm install

# Step 5: Copy the rest of your application's source code into the container
# The '.' means copy everything from the current directory (your backend folder) into the container's /app directory.
COPY . .

# Step 6: Expose the port your app runs on
# This tells Docker that the container will listen on port 5000 at runtime.
EXPOSE 5000

# Step 7: Define the command to run your application
# This is the command that will be executed when the container starts.
CMD [ "node", "server.js" ]