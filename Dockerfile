FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.25.2-alpine
COPY --from=build /app/dist/spa /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
