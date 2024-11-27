# Use a lightweight Node.js image
FROM node:16-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the JavaScript file into the container
COPY code.js /app/code.js

# Command to run the JavaScript file
CMD ["node", "/app/code.js"]
