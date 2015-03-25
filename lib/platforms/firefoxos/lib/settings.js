module.exports = {
    external: {
        adb: {
            name : 'adb',
            description: 'android sdk tool',
            platform : 'firefoxos',
            os_platforms: ['win32', 'linux', 'darwin'],
            print_version: 'adb version'
        }
    }
};
