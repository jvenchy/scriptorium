
# Use a lightweight PHP image
FROM php:cli

# Set the working directory inside the container
WORKDIR /app

# Copy the PHP script into the container
COPY code.php /app/code.php

# Command to run the PHP script
CMD ["php", "/app/code.php"]
