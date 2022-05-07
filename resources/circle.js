if (!process.env['CIRCLECI']) {
	console.log(`[CIRCLECI SCRIPT] CircleCI not found... Aborting script`)
	return
}

const {readFileSync, writeFile} = require('fs')
const pkg = JSON.parse(readFileSync('package.json').toString());

let channel = process.env['CIRCLE_BRANCH'];

if (process.env['CIRCLE_BRANCH'] === 'lts') {
	channel = 'latest'
} else if (process.env['CIRCLE_BRANCH'] === 'main') {
	channel = 'beta'
} else if (process.env['CIRCLE_BRANCH'] === 'develop') {
	channel = 'alpha'
}

channel = channel.split('/').join('-')

// https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
const version = pkg.version.split('.');
pkg.version = `${version[0]}.${version[1]}.${version[2]}-${channel}`
// package.build.channel = channel
pkg.publish = {
	"provider": "github",
	"repo": "cider-releases",
	"owner": "ciderapp",
	"vPrefixedTagName": true,
	"tag": `v${pkg.version}`,
	"channel": channel,
	"releaseType": "release"
}

const {exec} = require('child_process')

exec('echo $APP_VERSION', {env: {'APP_VERSION': pkg.version}}, function (error, stdout, stderr) {
	console.log(stdout, stderr, error);
});

writeFile('package.json', JSON.stringify(pkg), err => {
	// error checking
	if (err) throw err;
	console.log(`VERSION CHANGED TO ${pkg.version}`);
});

