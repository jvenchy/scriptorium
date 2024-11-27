# Use a lightweight Ruby image
FROM ruby:slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Ruby script into the container
COPY code.rb /app/code.rb

# Command to run the Ruby script
CMD ["ruby", "/app/code.rb"]
