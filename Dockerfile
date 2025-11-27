# ==================================
# 1. BUILD STAGE
# ==================================
FROM node:20 AS build

# Set the environment to production to skip installing devDependencies
ENV NODE_ENV=production

# -----------------
# 1a. Backend Build
# -----------------
WORKDIR /app/backend
COPY backend/package*.json ./
# Use npm ci for faster, deterministic installs
RUN npm ci

# -----------------
# 1b. Frontend Build
# -----------------
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
RUN npm ci
COPY frontend/ .
RUN npm run build

# -----------------
# 1c. Final Assembly in Build Stage
# -----------------
WORKDIR /app

# Copy the rest of the backend source (including index.js, etc.)
COPY backend backend/

# Use RUN mv to move the compiled frontend files to the backend public folder
# This is the fix for the circular dependency error.
RUN mv frontend/build backend/public

# ==================================
# 2. FINAL RUNTIME STAGE
# ==================================
FROM node:20-slim 
# Using slim for a smaller final image
WORKDIR /app

# Only copy the essential backend runtime files
COPY --from=build /app/backend .

# Use the 'node' user for better security
USER node

EXPOSE 5000

# The production command
CMD ["npm", "start"]