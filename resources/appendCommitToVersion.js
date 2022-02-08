if (!process.env['CIRCLECI']) {
    console.log(`[CIRCLECI SCRIPT] CircleCI not found... Aborting script`)
    return
}

let fs = require('fs')

var data = fs.readFileSync('package.json');
var package = JSON.parse(data);

pvers = package.version.match(/\d+\./g)

// https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
package.version = ${pvers[0]}${pvers[1]}${process.env['CIRCLE_BUILD_NUM']}


fs.writeFile('package.json', JSON.stringify(package), err => {
    // error checking
    if(err) throw err;
    console.log("VERSION CHANGED");
});   
