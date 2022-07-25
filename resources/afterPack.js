exports.default = function(context) {
    const { execSync } = require('child_process')
    const fs = require('fs')

    if (process.platform !== 'darwin')
        return
    
    if (fs.existsSync('dist/mac-universal--x64/Cider.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources/Electron Framework.sig'))
        fs.unlinkSync('dist/mac-universal--x64/Cider.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources/Electron Framework.sig')
    if (fs.existsSync('dist/mac-universal--arm64/Cider.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources/Electron Framework.sig'))
        fs.unlinkSync('dist/mac-universal--arm64/Cider.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources/Electron Framework.sig')
    // console.log('Castlabs-evs update start')
    // execSync('python3 -m pip install --upgrade castlabs-evs')
    // console.log('Castlabs-evs update complete')

    // xcode 13 
    if (fs.existsSync('dist/mac-universal--x64') && fs.existsSync('dist/mac-universal--arm64') && fs.existsSync('dist/mac-universal--x64/Cider.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources/MainMenu.nib/keyedobjects-101300.nib'))
    execSync("cp 'dist/mac-universal--x64/Cider.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources/MainMenu.nib/keyedobjects-101300.nib' 'dist/mac-universal--arm64/Cider.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources/MainMenu.nib/keyedobjects-101300.nib'",{stdio: 'inherit'})

    // console.log('VMP signing start')
    // if (fs.existsSync('dist/mac-universal'))
    // execSync('python3 -m castlabs_evs.vmp -n sign-pkg dist/mac-universal',{stdio: 'inherit'})
    // if (fs.existsSync('dist/mac'))
    // execSync('python3 -m castlabs_evs.vmp -n sign-pkg dist/mac',{stdio: 'inherit'})
    // if (fs.existsSync('dist/mac-arm64'))
    // execSync('python3 -m castlabs_evs.vmp -n sign-pkg dist/mac-arm64 -z',{stdio: 'inherit'})
    
    if (fs.existsSync('dist/mac-x64') || fs.existsSync('dist/mac-universal--x64') )
       execSync('cd ./node_modules/cider_utils; yarn run prebuild-downloads --platform=darwin --arch=arm64 --verbose; cd ../..',{stdio: 'inherit'})
    
    // console.log('VMP signing complete')

}
