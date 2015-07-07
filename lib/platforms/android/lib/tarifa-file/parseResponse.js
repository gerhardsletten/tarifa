module.exports = function (response, o) {
    if(response.keystore_path && response.keystore_alias) {
        o.signing = o.signing || {};
        o.signing.android = {
            store: {
                keystore_path: response.keystore_path,
                keystore_alias: response.keystore_alias
            }
        };
        o.configurations.android.prod.sign = 'store';
    }

    if (response.hockeyapp) {
        if (response.platforms.indexOf('android') !== -1) {
            o.configurations.android.stage.hockeyapp_id = 'put here your hockeyapp app id';
        }
    }

    return o;
};
