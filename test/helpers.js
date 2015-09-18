var path = require('path'),
    spawn = require('tape-spawn'),
    test = require('tape'),
    format = require('util').format,
    fs = require('fs'),
    untildify = require('untildify'),
    catNames = require('cat-names'),
    rimraf = require('rimraf'),
    os = require('os'),
    currentProjectVal = {},
    currentPluginVal = {};

function cat() { return catNames.random().replace(/ /g, '').toLowerCase(); }

function values () {
    var tmpPath = path.resolve(__dirname, '..', 'test', 'tmp', cat() + cat()),
        id = format('%s.%s', cat(), cat()),
        name = cat();

    return {
        tmpPath: tmpPath,
        id: id,
        name: name
    };
}

function cmd(args) {
    return format('node "%s" %s', path.resolve(__dirname, '..', 'bin', 'cmd.js'), args);
}

var platformNames = {
    'darwin': ['ios', 'android', 'browser', 'firefoxos'],
    'win32': ['android', 'wp8', 'browser'],
    'linux': ['android', 'browser']
};

module.exports.platforms = function () {
    return platformNames[os.platform()];
};

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
            'create --path="%s" --id=%s --name=%s',
            currentProjectVal.tmpPath,
            currentProjectVal.id,
            currentProjectVal.name
        ),
        st = spawn(t, cmd(c), {
            stdio: 'inherit'
        });
    st.succeeds();
    st.end();
};

module.exports.plugin = function(t) {
    var c = format(
            'create plugin --path="%s" --id=%s --name=%s',
            currentPluginVal.tmpPath,
            currentPluginVal.id,
            currentPluginVal.name
        ),
        st = spawn(t, cmd(c), {
            stdio: 'inherit'
        });
    st.succeeds();
    st.end();
};

module.exports.usageTest = function (action) {
    return function (t) {
        var st = spawn(t, cmd(action + ' -h')),
            usageFilePath = path.join(__dirname, '..', 'actions', action.replace(/ /g, '/'), 'usage.txt'),
            helpText = fs.readFileSync(usageFilePath).toString() + '\n';

        st.stdout.match(helpText, 'help text matched');
        st.succeeds();
        st.end();
    };
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

module.exports.cleanTest = function (dir) {

    test('adb kill-server', function (t) {
        var st = spawn(t, 'adb kill-server', {
            stdio: 'inherit'
        });
        st.succeeds();
        st.end();
    });

    test('cleanup: tmp folder', function (t) {
        process.chdir(dir);
        try {
            rimraf.sync(path.resolve(__dirname, 'tmp'));
            fs.mkdirSync(path.resolve(__dirname, 'tmp'));
            fs.closeSync(fs.openSync(path.resolve(__dirname, 'tmp', '.gitkeep'), 'w'));
            t.equal(fs.readdirSync(path.resolve(__dirname, 'tmp')).length, 1);
        } catch(err) {
            console.error(err);
        }
        t.end();
    });
};
