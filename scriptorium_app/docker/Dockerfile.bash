# Use a lightweight Bash image
FROM bash:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the Bash script into the container
COPY code.sh /app/code.sh

# Command to run the Bash script
CMD ["bash", "/app/code.sh"]
