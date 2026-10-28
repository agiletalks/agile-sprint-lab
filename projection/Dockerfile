FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --chown=node:node projection ./projection
USER node
RUN npm run build
ENV HOST=0.0.0.0 PORT=8080
EXPOSE 8080
CMD ["npm", "run", "dev"]
