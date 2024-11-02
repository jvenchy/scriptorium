#!/bin/bash

# Update package list
echo "Updating package list..."
sudo apt update

# Install Node.js for JavaScript
echo "Installing Node.js..."
sudo apt install -y nodejs npm

# Install Python
echo "Installing Python..."
sudo apt install -y python3 python3-pip

# Install Java (JDK)
echo "Installing Java Development Kit (JDK)..."
sudo apt install -y default-jdk

# Install GCC for C language
echo "Installing GCC..."
sudo apt install -y gcc

# Install G++ for C++ language
echo "Installing G++..."
sudo apt install -y g++

# Verify installations
echo "Verifying installations..."
echo -n "Node.js version: "; node -v
echo -n "npm version: "; npm -v
echo -n "Python version: "; python3 --version
echo -n "Java version: "; java -version
echo -n "GCC version: "; gcc --version | head -n 1
echo -n "G++ version: "; g++ --version | head -n 1

echo "All required languages and compilers/interpreters have been installed."
