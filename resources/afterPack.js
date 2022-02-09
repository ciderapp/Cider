exports.default = function(context) {
    const { execSync } = require('child_process')
    const fs = require('fs')

    if (process.platform !== 'darwin')
        return
    
    fs.unlinkSync(context.appOutDir + '/Cider.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources/Electron Framework.sig')
    console.log('Castlabs-evs update start')
    execSync('python3 -m pip install --upgrade castlabs-evs')
    console.log('Castlabs-evs update complete')

    

    console.log('VMP signing start')
    if (fs.existsSync('dist/mac-universal'))
    execSync('python3 -m castlabs_evs.vmp -n sign-pkg dist/mac-universal',{stdio: 'inherit'})
    if (fs.existsSync('dist/mac'))
    execSync('python3 -m castlabs_evs.vmp -n sign-pkg dist/mac',{stdio: 'inherit'})
    if (fs.existsSync('dist/mac-arm64'))
    execSync('python3 -m castlabs_evs.vmp -n sign-pkg dist/mac-arm64 -z',{stdio: 'inherit'})
    if (fs.existsSync('dist/mac-x64'))
    execSync('python3 -m castlabs_evs.vmp -n sign-pkg dist/mac-x64',{stdio: 'inherit'})
    
    console.log('VMP signing complete')
}