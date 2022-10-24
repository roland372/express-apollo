FROM node:16

RUN npm install -g nodemon

# specify where our app will be in a container
WORKDIR /usr/src/app

# copy package.json to working directory
#COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 5000

CMD ["npm", "start"]

# when we create our image it becomes read only, meaning if we want to make changes to it we'd have to rebuild it
# to get around of this we can use volumes
# we can map volumes to our docker, so if something changes in container our image will be rebuilt
# image itself does not change, only directories

# to create image
# docker build -t damian/express-apollo:nodemon .

#docker run -p 8000:3000 damian/express-apollo:nodemon -v C:\Users\damian.fatyga\WebstormProjects\express-apollo:/usr/src/app -v /usr/src/app/node_modules




# <----- ----->
# here we're putting instructions on how to run our container
# tell docker to put nodejs image in our container
#FROM node:latest

# move our code inside container
# COPY source dest
# copy all files from current directory, and store them in current directory
#WORKDIR /app

#COPY . .

#VOLUME ["/app/src"]

#ADD ./src ./src

# make docker install any neccessary packages
#RUN npm install

# commands to run to start out application
#CMD ["node", "src/index.js"]
# or
# CMD node src/index.js

# command to build docker
# -t - name of our image
# :1 - version
# . - build in current directory
# docker build -t damian/docker-testing:1 .

# docker image ls - to see all images we have on our computer

# docker run -p 8000:3000 damian/docker-testing:1 - to run docker
# docker run -p 8000:3000 -d damian/docker-testing:1 - to run docker in the background

# 8000 - on what port we want it to run
# :3000 - port that our own app is running

# docker container ls - to see all running containers

# docker container stop a405fd0bded1 - to stop container

# docker container logs 7a3fc4459a76 - to check logs