# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=24.11.0
ARG PNPM_VERSION=10.20.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

#RUN apt-get update && apt-get install -y \
#    libreoffice \
#    fonts-dejavu \
#    fonts-liberation \
#    fonts-freefont-ttf \
#    && rm -rf /var/lib/apt/lists/*

# Install pnpm.
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}





WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile



# Copy app source
COPY . .

# 🧩 Run Prisma migration (this also generates the client)
#RUN pnpm prisma:migrate

# 🏗️ Build your NestJS project (optional if you have dist/)
RUN pnpm build

# Fix: give node user permission to write dist folder
RUN chown -R node:node /usr/src/app

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 3001

# Run the application.
CMD ["sh", "-c", "pnpm start:prod"]


