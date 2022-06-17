if (!process.env['CIRCLECI']) {
	console.log(`[CIRCLECI SCRIPT] CircleCI not found... Aborting script`)
	return
}

const { readFileSync, writeFile } = require('fs')
const pkg = JSON.parse(readFileSync('package.json').toString());
let channel = process.env['CIRCLE_BRANCH'];

channel = channel.split('/').join('-')

// https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
const version = pkg.version.split('.');
const patch = version[2].split('-');
if (process.env['CIRCLE_BRANCH'] === 'release') {
	pkg.version = `${version[0]}.${version[1]}.${patch[0]}`
} else if (process.env['CIRCLE_BRANCH'] === 'main') {
	pkg.version = `${version[0]}.${version[1]}.${patch[0]}.beta.${patch[1]}`
} else {
	pkg.version = `${version[0]}.${version[1]}.${patch[0]}-${channel}.${process.env['CIRCLE_BUILD_NUM']}`
}
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

const { exec } = require('child_process')

exec(`echo $APP_VERSION`, { env: { 'APP_VERSION': pkg.version } }, function (error, stdout, stderr) {
	console.log(stdout, stderr, error);
});

writeFile('package.json', JSON.stringify(pkg), err => {
	// error checking
	if (err) throw err;
	console.log(`VERSION CHANGED TO ${pkg.version}`, pkg);
});

