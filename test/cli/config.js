var test = require('tape'),
    spawn = require('tape-spawn'),
    fs = require('fs'),
    path = require('path'),
    format = require('util').format,
    h = require('../helpers');

test('cli: tarifa config -h', function (t) {
    var st = spawn(t, h.cmd('config -h')),
        usageFilePath = path.join(__dirname, '../../actions/config/usage.txt'),
        iosFilePath = path.join(__dirname, '../../lib/platforms/ios/actions/config/usage.txt'),
        helpText = fs.readFileSync(usageFilePath).toString() + fs.readFileSync(iosFilePath).toString() + '\n';

    st.stdout.match(helpText, 'help text matched');
    st.succeeds();
    st.end();
});

test('cli: tarifa config icons file test.png stage', function (t) {
    var fixture = path.resolve(__dirname, '..', 'fixtures', 'momo.png'),
        st = spawn(t, h.cmd(format('config icons file "%s" stage --verbose', fixture)));
    st.succeeds();
    st.end();
});

test('cli: tarifa config icons generate red dev', function (t) {
    var st = spawn(t, h.cmd('config icons generate red dev'));
    st.succeeds();
    st.end();
});

test('cli: tarifa config splashscreens red dev', function (t) {
    var st = spawn(t, h.cmd('config splashscreens red dev'));
    st.succeeds();
    st.end();
});

test('cli: tarifa config icons generate red', function (t) {
    var st = spawn(t, h.cmd('config icons generate red'));
    st.succeeds();
    st.end();
});

test('cli: tarifa config splashscreens red', function (t) {
    var st = spawn(t, h.cmd('config splashscreens red'));
    st.succeeds();
    st.end();
});

test('cli: tarifa config splashscreens oops', function (t) {
    var st = spawn(t, h.cmd('config splashscreens oops'));
    st.fails();
    st.end();
});

test('cli: tarifa config icons generate oops', function (t) {
    var st = spawn(t, h.cmd('config icons generate oops'));
    st.fails();
    st.end();
});
