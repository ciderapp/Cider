if (!process.env['CIRCLECI']) {
    console.log(`[CIRCLECI SCRIPT] CircleCI not found... Aborting script`)
    return
}

let fs = require('fs')
const { exec } = require("child_process");

var data = fs.readFileSync('package.json');
var package = JSON.parse(data);

pvers = package.version.match(/\d+\./g)

// https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
package.version = `${pvers[0]}${pvers[1]}${process.env['CIRCLE_BUILD_NUM']}`

exec('echo $APP_VERSION', {env: {'APP_VERSION': package.version}}, function (error, stdout, stderr) 
{
    console.log(stdout, stderr, error);
});

fs.writeFile('package.json', JSON.stringify(package), err => {
    // error checking
    if(err) throw err;
    console.log(`VERSION CHANGED TO ${package.version}`);
});   
