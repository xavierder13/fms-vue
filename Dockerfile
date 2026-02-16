# /var/www/fms-vue/Dockerfile
FROM node:20-bullseye

WORKDIR /app

# Install Vue CLI globally
RUN npm install -g @vue/cli

# Copy package files if any
COPY package*.json ./

# Install dependencies if package.json exists
RUN if [ -f package.json ]; then npm install; fi

# Copy all files
COPY . .

EXPOSE 5173

# On first run: scaffold Vue + Vuetify if project is empty, then run dev server
CMD sh -c "\
  if [ ! -f package.json ]; then \
    vue create . --default && \
    vue add vuetify; \
  fi && \
  npm install && \
  npm run dev"
