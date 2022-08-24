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
COMMIT_SINCE_STABLE=$(git rev-list $STABLE_SHA..HEAD --count --since="$SHA_DATE")
CURRENT_VERSION=$(node -p -e "require('./package.json').version")

# Set the version number for commits on main branch
if [[ ($CIRCLE_BRANCH == "main" || $GITHUB_REF_NAME == "main") && $COMMIT_SINCE_STABLE -gt 0 && $(node -p -e "require('./package.json').version" | cut -d '.' -f 4) != $COMMIT_SINCE_STABLE ]]; then
	NEW_VERSION="${CURRENT_VERSION}-beta.${COMMIT_SINCE_STABLE}"
	# Update the version in package.json
	if [[ $RUNNER_OS == "macOS" ]]; then
		sed -i "" -e "s/$CURRENT_VERSION/$NEW_VERSION/" package.json
	else
		sed -i "0,/$CURRENT_VERSION/s//$NEW_VERSION/" package.json
	fi
	echo $NEW_VERSION
else
	echo $CURRENT_VERSION
fi
