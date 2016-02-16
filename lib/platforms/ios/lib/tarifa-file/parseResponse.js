module.exports = function (response, o) {

    if(response.deploy) {
        o.deploy = {
            apple_id: response.apple_id
        };
    }

    if(response.adhoc_apple_developer_identity
            || response.adhoc_provisioning_profile_path
            || response.adhoc_provisioning_profile_name) {
        o.signing = o.signing || {};
        o.signing.ios = {
            adhoc: {
                identity: response.adhoc_apple_developer_identity || "FIXME",
                provisioning_path: response.adhoc_provisioning_profile_path || "FIXME",
                provisioning_name: response.adhoc_provisioning_profile_name || "FIXME"
            }
        };
        o.configurations.ios.stage.sign = 'adhoc';
    }

    if(response.store_apple_developer_identity
            || response.store_provisioning_profile_path
            || response.store_provisioning_profile_name) {

        o.signing = o.signing || {};
        o.signing.ios = o.signing.ios || {};
        o.signing.ios.store = {
            identity: response.store_apple_developer_identity || "FIXME",
            provisioning_path: response.store_provisioning_profile_path || "FIXME",
            provisioning_name: response.store_provisioning_profile_name || "FIXME"
        };
        o.configurations.ios.prod.sign = 'store';
    }

    if(response.has_apple_developer_team && response.apple_developer_team) {
        o.deploy.apple_developer_team = response.apple_developer_team;
    }

    if (response.hockeyapp) {
        if (response.platforms.indexOf('ios') !== -1) {
            o.configurations.ios.stage.hockeyapp_id = 'put here your hockeyapp app id';
        }
    }

    return o;
};
