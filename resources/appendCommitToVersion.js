if (!process.env['CIRCLECI']) {
    console.log(`[CIRCLECI SCRIPT] CircleCI not found... Aborting script`)
    return
}

let fs = require('fs')

var data = fs.readFileSync('package.json');
var package = JSON.parse(data);

//Six chars of commit sha
// https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables
let shortCommitSha = String(process.env['CIRCLE_SHA1']).slice(0,5)


package.version = `${package.version}-${shortCommitSha}`


fs.writeFile('package.json', newData, err => {
    // error checking
    if(err) throw err;
    console.log("VERSION CHANGED");
});   
