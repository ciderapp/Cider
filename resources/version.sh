#!/bin/bash

# Setup the variables needed
if [[ $GH_REQUEST_TOKEN != "" ]]; then
	STABLE_SHA=$(curl -H "Authorization: token ${GH_REQUEST_TOKEN}" -s https://api.github.com/repos/ciderapp/Cider/branches/stable | grep '"sha"' | head -1 | cut -d '"' -f 4)
elif [[ $GITHUB_TOKEN != "" ]]; then
	STABLE_SHA=$(curl -H "Authorization: token ${GITHUB_TOKEN}" -s https://api.github.com/repos/ciderapp/Cider/branches/stable | grep '"sha"' | head -1 | cut -d '"' -f 4)
else
	STABLE_SHA=$(curl -s https://api.github.com/repos/ciderapp/Cider/branches/stable | grep '"sha"' | head -1 | cut -d '"' -f 4)
fi

SHA_DATE=$(git show -s --format=%ci $STABLE_SHA)
VERSION_POSTFIX=$(git rev-list $STABLE_SHA..HEAD --count --since="$SHA_DATE")
CURRENT_VERSION=$(node -p -e "require('./package.json').version" | cut -d '-' -f 1)

# Set the version number for commits on main branch
if [[ ($CIRCLE_BRANCH == "main" || $GITHUB_REF_NAME == "main") && $VERSION_POSTFIX -gt 0 ]]; then
  NEW_VERSION_NUMBERED="$CURRENT_VERSION-beta.$(printf "%03d\n" $VERSION_POSTFIX)"
	NEW_VERSION="${CURRENT_VERSION}-beta.${VERSION_POSTFIX}"

	# Update the version in package.json
  if [[ $NO_WRITE_VER == "" && $(node -p -e "require('./package.json').version" | cut -d '.' -f 4) != $VERSION_POSTFIX ]]; then
    if [[ $RUNNER_OS == "macOS" ]]; then
      sed -i "" -e "s/$CURRENT_VERSION/$NEW_VERSION/" package.json
    else
      sed -i "0,/$CURRENT_VERSION/s//$NEW_VERSION/" package.json
    fi
  fi
else
  NEW_VERSION_NUMBERED=$CURRENT_VERSION
	NEW_VERSION=$CURRENT_VERSION
fi

echo $NEW_VERSION


# Add the version to the environment for CI usage
if [[ $GITHUB_REF_NAME != "" ]]; then
  echo "APP_VERSION=$NEW_VERSION" >>$GITHUB_ENV
  echo "RELEASE_VERSION=$NEW_VERSION_NUMBERED" >>$GITHUB_ENV
elif [[ $CIRCLE_BRANCH != "" ]]; then
  echo "export APP_VERSION=$NEW_VERSION" >>$BASH_ENV
  echo "export RELEASE_VERSION=$NEW_VERSION_NUMBERED" >>$BASH_ENV
fi
