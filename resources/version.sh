#!/bin/bash

# Setup the variables needed
STABLE_SHA=$(curl -H "Authorization: token ${RELEASE_TOKEN}" https://api.github.com/repos/ciderapp/Cider/branches/stable | grep '"sha"' | head -1 | cut -d '"' -f 4)
SHA_DATE=$(git show -s --format=%ci $STABLE_SHA)
COMMIT_SINCE_STABLE=$(git rev-list $STABLE_SHA..HEAD --count --since="$SHA_DATE")
CURRENT_VERSION=$(node -p -e "require('./package.json').version")
LATEST_VERSION=$(curl -s https://api.github.com/repos/ciderapp/cider-releases/releases/latest | grep tag_name | cut -d '"' -f 4 | sed 's/v//' | xargs)

# Debugging
echo "STABLE_SHA: $STABLE_SHA"
echo "SHA_DATE: $SHA_DATE"
echo "COMMIT_SINCE_STABLE: $COMMIT_SINCE_STABLE"
echo "CURRENT_VERSION: $CURRENT_VERSION"
echo "LATEST_VERSION: $LATEST_VERSION"

# Set the version number for commits on main branch
if [[ ($CIRCLE_BRANCH == "main" || $GITHUB_REF_NAME == "main") && $COMMIT_SINCE_STABLE -gt 0 ]]; then
  NEW_VERSION="${CURRENT_VERSION}-beta.${COMMIT_SINCE_STABLE}"

  # This is shit
  if [[ $GITHUB_REF_NAME == "main" && $CURRENT_VERSION == $NEW_VERSION ]]; then
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
