# Use a lightweight GCC image
FROM gcc:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the C source file into the container
COPY code.c /app/code.c

# Compile and run the C program
CMD ["sh", "-c", "gcc /app/code.c -o /app/code && /app/code"]
