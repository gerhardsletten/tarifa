module.exports = {
    external: {
        adb: {
            name : 'adb',
            description: 'android sdk tool',
            platform : 'firefoxos',
            os_platforms: ['win32', 'linux', 'darwin'],
            print_version: 'adb version'
        },
        firefoxos: {
            fs: '/system/b2g/b2g'
        }
    }
};
