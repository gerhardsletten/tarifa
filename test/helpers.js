var path = require('path'),
    spawn = require('tape-spawn'),
    format = require('util').format,
    fs = require('fs'),
    untildify = require('untildify'),
    catNames = require('cat-names'),
    currentProjectVal = {},
    currentPluginVal = {};

function cat() { return catNames.random().replace(/ /g, '').toLowerCase(); }

function values () {
    var tmpPath = path.resolve(__dirname, '../test/tmp/', cat()),
        id = format('%s.%s', cat(), cat()),
        name = cat();

    return {
        tmpPath: tmpPath,
        id: id,
        name: name
    };
}

function cmd(args) {
    return format('node %s %s', path.resolve(__dirname, '../bin/cmd.js'), args);
}

module.exports.projectValues = function () {
    currentProjectVal = values();
};

module.exports.pluginValues = function () {
    currentPluginVal = values();
};

module.exports.currentProjectVal = function () {
    return currentProjectVal;
};

module.exports.currentPluginVal = function () {
    return currentPluginVal;
};

module.exports.project = function(t) {
    var c = format(
            'create --path %s --id %s --name %s',
            currentProjectVal.tmpPath,
            currentProjectVal.id,
            currentProjectVal.name
        ),
        st = spawn(t, cmd(c));
    st.exitCode(0);
    st.end();
};

module.exports.plugin = function(t) {
    var c = format(
            'create plugin --path %s --id %s --name %s',
            currentPluginVal.tmpPath,
            currentPluginVal.id,
            currentPluginVal.name
        ),
        st = spawn(t, cmd(c));
    st.exitCode(0);
    st.end();
};

module.exports.cmd = cmd;

module.exports.isFile = function (/* args */) {
    var args = Array.prototype.slice.call(arguments, 0);
    return fs.statSync(path.resolve(untildify(path.join.apply(this, args)))).isFile();
};

module.exports.isDirectory = function (/* args */) {
    var args = Array.prototype.slice.call(arguments, 0);
    return fs.statSync(path.resolve(untildify(path.join.apply(this, args)))).isDirectory();
};
