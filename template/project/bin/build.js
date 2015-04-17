/*
 * build.js
 */

var browserify = require('browserify'),
    watchify = require('watchify'),
    Q = require('q'),
    path = require('path'),
    fs = require('fs'),
    chokidar = require('chokidar'),

    w, // watchify instance
    watcher, // chokidar watcher instance

    src = path.join(__dirname, '../src/app.js'),
    settings = path.join(__dirname, 'settings.json'),
    out = path.join(__dirname, '../www/main.js'),
    www = path.join(__dirname, '../www');

function log(o) { if(o) console.log('- browserify - ' + o); }

function rejectOnError(d) {
    return function (err) { log(err); if(err) d.reject(err); };
}

function bundle(conf) {
    var defer = Q.defer(),
        b = browserify({ cache: {}, packageCache: {}, fullPaths: true });

    if(fs.existsSync(settings)) fs.unlinkSync(settings);
    if(fs.existsSync(out)) fs.unlinkSync(out);

    fs.writeFileSync(settings, JSON.stringify(conf), null, 2);

    var ws = fs.createWriteStream(out);

    b.add(src)
        .exclude('settings')
        .require(settings, { expose : 'settings' })
        .bundle(rejectOnError(defer))
        .pipe(ws);

    ws.on('finish', function() { ws.end(); defer.resolve(b); });

    return defer.promise;
}

function run(conf, f){
    return bundle(conf).then(function (b) {
        var w = watchify(b);

        b.bundle(function () { w.on('log', log); });

        w.on('update', function () {
            var ws = fs.createWriteStream(out);

            w.bundle(log).pipe(ws);

            ws.on('finish', function() { ws.end(); f(out); });
        });
        return w;
    });
}

module.exports.build = function build(platform, localSettings, config) {
    return bundle(localSettings.configurations[platform][config]);
};

module.exports.watch = function watch(f, localSettings, platform, config, confEmitter) {
    run(localSettings.configurations[platform][config], f).then(function (bw) {
        watcher = chokidar.watch(www, { ignored: /main\.js/, persistent: true });

        setTimeout(function () {
            watcher.on('all', function (evt, p) { f(p); });
        }, 4000);

        confEmitter.on('change', function (conf) {
            fs.writeFileSync(settings, JSON.stringify(conf), null, 2);
        });
    });
};

module.exports.close = function () {
    if(w) w.close();
    if(watcher) watcher.close();
};
