#!/bin/bash

LATEST_SHA=$(curl -s https://api.github.com/repos/ciderapp/Cider/branches/stable | grep sha | cut -d '"' -f 4 | sed 's/v//' | xargs)
COMMITSINCESTABLE=$(git rev-list $LATEST_SHA..HEAD --count)
CURRENT_VERSION=$(node -p -e "require('./package.json').version")
CIRCLE_BRANCH="main"
if [[ $CIRCLE_BRANCH == "main" && $COMMITSINCESTABLE -gt 0 ]]; then
  NEW_VERSION="${CURRENT_VERSION}-beta.${COMMITSINCESTABLE}"
else
  NEW_VERSION=${CURRENT_VERSION/0/$COMMITSINCESTABLE}
fi

if [[ $COMMITSINCESTABLE -gt 0 ]]; then
  echo "Version: $NEW_VERSION"
  sed -i "0,/$CURRENT_VERSION/s//$NEW_VERSION/" package.json
else
  echo "Version unchanged, commits since stable is ${COMMITSINCESTABLE}"
fi

echo "export APP_VERSION=$(node -p -e 'require("./package.json").version')" >>$BASH_ENV
