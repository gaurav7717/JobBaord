# Use Node.js base image
FROM node:18

# Install Python inside Node.js container
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install Node.js dependencies
COPY package*.json ./ 
RUN npm install

# Copy Python dependencies
COPY predict/requirements.txt ./predict/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages -r ./predict/requirements.txt

# Copy the entire project into the container
COPY . .

# Set environment variables for MongoDB
ENV MONGO_URI="mongodb+srv://adminUser:adminUser@cluster0.cxeml.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
ENV PORT=5000
ENV DATABASE_NAME="job_board"
ENV COLLECTION_NAME="job_listings"

# Expose the port for the Node.js server
EXPOSE 5000

# Start Node.js server
CMD ["node", "server.js"]
