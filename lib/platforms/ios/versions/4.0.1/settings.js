module.exports.beforeCompile = function (conf, options) {
    options.device = true;
    options.noSign = true;
    return options;
};
