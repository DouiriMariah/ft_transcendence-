#!/bin/sh

docker container rm -f $(docker container ls -qa)
docker volume rm -f $(docker volume ls -qa)
docker volume rm -f $(docker volume ls )
docker image rm -f $(docker image ls -qa)
docker system prune -af