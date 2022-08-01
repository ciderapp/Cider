#!/bin/bash

printenv
# DEBUGGING
LATEST_SHA=$(curl -s https://api.github.com/repos/ciderapp/Cider/branches/stable | grep sha | cut -d '"' -f 4 | sed 's/v//' | xargs | cut -d' ' -f1)
echo $LATEST_SHA
COMMITSINCESTABLE=$(git rev-list $LATEST_SHA..HEAD --count)
echo $COMMITSINCESTABLE
CURRENT_VERSION=$(node -p -e "require('./package.json').version")
echo $CURRENT_VERSION
GITHUB_BASE_REF="main"
echo $GITHUB_BASE_REF

#############################################################################################

if [[ ($CIRCLE_BRANCH == "main" || $GITHUB_BASE_REF == "main") && $COMMITSINCESTABLE -gt 0 ]]; then
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

if [[ -z "${GITHUB_ENV}" ]]; then
  echo "APP_VERSION=$(node -p -e 'require("./package.json").version')" >>$GITHUB_ENV
elif [[ -z "${BASH_ENV}" ]]; then
  echo "export APP_VERSION=$(node -p -e 'require("./package.json").version')" >>$BASH_ENV
fi
