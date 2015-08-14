var test = require('tape'),
    spawn = require('tape-spawn'),
    tarifa = require('../helpers').cmd,
    pkg = require('../../package.json');

test('tarifa -v', function (t) {
    var st = spawn(t, tarifa('-v'));
    st.stdout.match(pkg.version + '\n');
    st.exitCode(0);
    st.end();
});
