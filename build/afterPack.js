exports.default = function(context) {
    const { execSync } = require('child_process')

    if (process.platform !== 'darwin')
        return
        
    console.log('Castlabs-evs update start')
    execSync('python3 -m pip install --upgrade castlabs-evs')
    console.log('Castlabs-evs update complete')



    console.log('VMP signing start')

    execSync('python3 -m castlabs_evs.vmp -n sign-pkg dist/mac',{stdio: 'inherit'})
    
    console.log('VMP signing complete')
}