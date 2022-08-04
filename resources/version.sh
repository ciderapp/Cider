#!/bin/bash

STABLE_SHA=$(curl -s https://api.github.com/repos/ciderapp/Cider/branches/stable | grep '"sha"' | head -1 | cut -d '"' -f 4)
SHA_DATE=$(git show -s --format=%ci $STABLE_SHA)
COMMITSINCESTABLE=$(git rev-list $STABLE_SHA..HEAD --count --since="$SHA_DATE")
CURRENT_VERSION=$(node -p -e "require('./package.json').version")
LATEST_VERSION=$(curl -s https://api.github.com/repos/ciderapp/cider-releases/releases/latest | grep tag_name | cut -d '"' -f 4 | sed 's/v//' | xargs)

# Set the version number for commits on main branch
if [[ ($CIRCLE_BRANCH == "main" || $GITHUB_REF_NAME == "main") && $COMMITSINCESTABLE -gt 0 ]]; then
  NEW_VERSION="${CURRENT_VERSION}-beta.${COMMITSINCESTABLE}"

  if [[ $GITHUB_REF_NAME == "main" && $LATEST_VERSION != $NEW_VERSION ]]; then
    echo "No version could be made. Picking latest tag."
    NEW_VERSION="${LATEST_VERSION}"
  fi

  # Update the version in package.json
  if [[ $RUNNER_OS == "macOS" ]]; then
    sed -i "" -e "s/$CURRENT_VERSION/$NEW_VERSION/" package.json
  else
    sed -i "0,/$CURRENT_VERSION/s//$NEW_VERSION/" package.json
  fi
  echo "Version updated to v${NEW_VERSION}"
else
  echo "Not on main branch or no commits since stable. Skipping version update."
fi

# Add the version to the environment for CI usage
if [[ $GITHUB_REF_NAME != "" ]]; then
  echo "APP_VERSION=$(node -p -e 'require("./package.json").version')" >>$GITHUB_ENV
else
  echo "export APP_VERSION=$(node -p -e 'require("./package.json").version')" >>$BASH_ENV
fi
