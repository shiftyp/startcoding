FROM node as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . ./

RUN npm run build

FROM node as runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./

RUN npm install --omit=dev

COPY --from=builder /usr/src/app/lib ./lib

CMD [ "npm", "start" ]