#!/bin/bash

LATEST_SHA=$(curl -s https://api.github.com/repos/ciderapp/Cider/branches/stable | grep sha | cut -d '"' -f 4 | sed 's/v//' | xargs)
COMMITSINCESTABLE=$(git rev-list $LATEST_SHA..HEAD --count)
CURRENT_VERSION=$(node -p -e "require('./package.json').version")
NEW_VERSION=${CURRENT_VERSION/-/.}.$COMMITSINCESTABLE
echo "Version: $NEW_VERSION"
sed -i "0,/$CURRENT_VERSION/s//$NEW_VERSION/" package.json
