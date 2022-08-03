#!/bin/bash

STABLE_SHA=$(curl -s https://api.github.com/repos/ciderapp/Cider/branches/stable | grep '"sha"' | head -1 | cut -d '"' -f 4)
SHA_DATE=$(git show -s --format=%ci $STABLE_SHA)
#COMMITSINCESTABLE=$(git rev-list $STABLE_SHA..HEAD --count --since="$SHA_DATE")
COMMITSINCESTABLE=9
CURRENT_VERSION=$(node -p -e "require('./package.json').version")

echo "Commits since stable: $COMMITSINCESTABLE"

# Make the version number
if [[ $CIRCLE_BRANCH == "stable" || $GITHUB_REF_NAME == "stable" ]]; then
  echo "This is a stable branch. Setting stable version."
  NEW_VERSION=${CURRENT_VERSION/0/$COMMITSINCESTABLE}
elif [[ $COMMITSINCESTABLE -gt 0 ]]; then
  echo "This is not a stable branch, but there are commits since the last stable release. Setting beta version."
  NEW_VERSION="${CURRENT_VERSION}-beta.${COMMITSINCESTABLE}"
fi

echo "Version: $NEW_VERSION"
echo "Current version: $CURRENT_VERSION"
if [[ $COMMITSINCESTABLE -gt 0 ]]; then
  if [[ $RUNNER_OS == "macOS" ]]; then
    sed -i "" -e "s/$CURRENT_VERSION/$NEW_VERSION/" package.json
  else
    sed -i "0,/$CURRENT_VERSION/s//$NEW_VERSION/" package.json
  fi
else
  echo "Version unchanged, commits since stable is ${COMMITSINCESTABLE}"
fi

if [[ $GITHUB_REF_NAME != "" ]]; then
  echo "APP_VERSION=$(node -p -e 'require("./package.json").version')" >>$GITHUB_ENV
else
  echo "export APP_VERSION=$(node -p -e 'require("./package.json").version')" >>$BASH_ENV
fi

node -p -e "require('./package.json').version"
printenv