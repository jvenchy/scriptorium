# Use a lightweight OpenJDK image
FROM openjdk:11-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Java source file into the container and rename it to Main.java
COPY code.java /app/Main.java

# Compile and run the Java program
CMD sh -c "javac /app/Main.java && java -cp /app Main"
