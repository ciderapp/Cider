exports.default = function(context) {
  const { execSync } = require('child_process')
  
  if (process.platform === "win32") {
      console.log('VMP signing start')
      execSync('python3 -m castlabs_evs.vmp sign-pkg ' + context.appOutDir,{stdio: 'inherit'})
      console.log('VMP signing complete')
  }
}