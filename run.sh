#!/bin/bash

ACTION="$1"
PACKAGE="$2"

for env in "${@:3}"; do
  echo "--------------------"
  echo "Running $ACTION for $PACKAGE on $env"
  echo "--------------------"
  node . -d "$PACKAGE" -e "$env" "--$ACTION"
done
