# Use a lightweight Perl image
FROM perl:slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Perl script into the container
COPY code.pl /app/code.pl

# Command to run the Perl script
CMD ["perl", "/app/code.pl"]
