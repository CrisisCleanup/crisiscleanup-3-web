#!/bin/bash
printf "%s" "waiting for Crisis Cleanup Api..."
until $(curl --output /dev/null --silent --head --fail http://localhost:5000/health); do
  printf "%c" "."
  sleep 5
done
sleep 20 # final delay
printf "\n%s\n" "CC3Api Online!"
