#!/bin/bash

# Startup script for scriptorium_app

# Run install script
echo "Running install.sh..."
bash install.sh

# Navigate to scriptorium_app directory
echo "Changing directory to scriptorium_app..."
cd scriptorium_app

# Install npm packages
echo "Installing npm packages..."
npm install

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate dev

# Create admin
node utils/createAdmin.js

echo "Startup script completed successfully!"
