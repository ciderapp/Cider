if (!process.env['CIRCLECI']) {
	console.log(`[CIRCLECI SCRIPT] CircleCI not found... Aborting script`)
	return
}

let fs = require('fs')


const data = fs.readFileSync('package.json');
const pkg = JSON.parse(data.toString());

let channel;
if (process.env['CIRCLE_BRANCH'] === 'lts') {
	channel = 'latest'
} else if (process.env['CIRCLE_BRANCH'] === 'main') {
	channel = 'beta'
} else if (process.env['CIRCLE_BRANCH'] === 'develop') {
	channel = 'alpha'
} else {
	channel = process.env['CIRCLE_BRANCH'] // It won't have auto update support
}


if (channel.concat('/')) {
	channel.replace('/', '-')
}

// https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
const version = pkg.version.split('.');
pkg.version = `${version[0]}.${version[1]}.${version[2]}-${channel}.${process.env['CIRCLE_BUILD_NUM']}`
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

let {exec} = require('child_process')
exec('echo $APP_VERSION', {env: {'APP_VERSION': pkg.version}}, function (error, stdout, stderr) {
	console.log(stdout, stderr, error);
});
fs.writeFile('package.json', JSON.stringify(pkg), err => {
	// error checking
	if (err) throw err;
	console.log(`VERSION CHANGED TO ${pkg.version}`);
});

