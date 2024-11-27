# Use a lightweight Lua image
FROM esolang/lua

# Set the working directory inside the container
WORKDIR /app

# Copy the Lua script into the container
COPY code.lua /app/code.lua

# Command to run the Lua script
CMD ["lua", "/app/code.lua"]
