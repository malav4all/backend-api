# Stage 1: Build stage.
FROM alpine AS build
WORKDIR /code
COPY package*.json /code
RUN apk update ; apk add nodejs npm ; npm install --force
COPY . .
RUN npm run build

# Stage 2: Deploy Production.
FROM alpine AS runtime
WORKDIR /code
COPY package*.json ./
RUN apk update ; apk add nodejs npm --no-cache ; yarn install --only=production --force ; apk add tzdata ; ln -snf /usr/share/zoneinfo/Asia/Kolkata /etc/localtime && echo "Asia/Kolkata" > /etc/timezone
COPY --from=build /code/dist ./dist
COPY --from=build /code/.env /code/
EXPOSE 8080
CMD ["node", "/code/dist/main.js"]