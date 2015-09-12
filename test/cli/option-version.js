var test = require('tape'),
    spawn = require('tape-spawn'),
    tarifa = require('../helpers').cmd,
    pkg = require('../../package.json');

test('cli: tarifa -v', function (t) {
    var st = spawn(t, tarifa('-v'));
    st.stdout.match(pkg.version + '\n');
    st.succeeds();
    st.end();
});
