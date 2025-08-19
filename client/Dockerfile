# --- Stage 1: Build the React Application ---
# We use a Node.js image to build our static files. We name this stage 'build'.
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application for production
# This creates an optimized 'dist' folder with our static files.
RUN npm run build


# --- Stage 2: Serve the Application with Nginx ---
# Now, we use a very lightweight web server image to serve the files we just built.
FROM nginx:stable-alpine

# Copy the built static files from the 'build' stage to Nginx's web server directory.
# The 'dist' folder is the standard output for Vite builds. If you used Create React App, this might be 'build'.
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration. This is crucial for single-page applications
# to handle routing correctly. It tells Nginx to always serve index.html for any
# path that isn't a file on disk, allowing React Router to take over.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80, which is the default port for Nginx
EXPOSE 80

# The default command for the nginx image is to start the server, so we don't need a CMD.