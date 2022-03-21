

if (!process.env['CIRCLECI']) {
    console.log(`[CIRCLECI SCRIPT] CircleCI not found... Aborting script`)
    return
}

let fs = require('fs')


var data = fs.readFileSync('package.json');
var package = JSON.parse(data);



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



// https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
var pvers = package.version.split('.')
package.version = `${pvers[0]}.${pvers[1]}.${pvers[2]}-${channel}.${process.env['CIRCLE_BUILD_NUM']}`
package.build.channel = channel
package.publish = {
    "provider": "github",
    "repo": "cider-releases",
    "owner": "ciderapp",
    "vPrefixedTagName": true,
    "tag": `v${package.version}`,
    "channel": channel,
    "releaseType": "release"
}

let {exec} = require('child_process')
exec('echo $APP_VERSION', {env: {'APP_VERSION': package.version}}, function (error, stdout, stderr)
{
    console.log(stdout, stderr, error);
});
fs.writeFile('package.json', JSON.stringify(package), err => {
    // error checking
    if(err) throw err;
    console.log(`VERSION CHANGED TO ${package.version}`);
    process.exit()
});

