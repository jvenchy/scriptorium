# Use a lightweight GCC image
FROM gcc:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the C++ source file into the container
COPY code.cpp /app/code.cpp

# Compile and run the C++ program
CMD ["sh", "-c", "g++ /app/code.cpp -o /app/code && /app/code"]
