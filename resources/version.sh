#!/bin/bash

LATESTSHA=$(curl -s https://api.github.com/repos/ciderapp/Cider/branches/stable | grep sha | cut -d '"' -f 4 | sed 's/v//' | xargs)
COMMITSINCESTABLE=$(git rev-list $LATESTSHA..HEAD --count)
VERSION=$(grep '"version":.*' package.json | cut -d '"' -f 4 | head -1)
echo 
NEWVERSION=${VERSION/-/.}-$COMMITSINCESTABLE
npm version $NEWVERSION