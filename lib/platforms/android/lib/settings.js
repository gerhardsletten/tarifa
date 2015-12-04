module.exports = {
    external: {
        adb: {
            name: 'adb',
            description: 'android sdk tool',
            platform: 'android',
            os_platforms: ['win32', 'linux', 'darwin'],
            print_version: 'adb version'
        },
        keytool: {
            name: 'keytool',
            description: 'java key and certificate management Tool',
            platform: 'android',
            os_platforms: ['win32', 'linux', 'darwin']
        }
    }
};
