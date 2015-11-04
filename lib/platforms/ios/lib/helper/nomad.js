module.exports.team = function (name) {
    return name ? (' --team \'' + name + '\'') : '';
};
