var test = require('tape'),
    spawn = require('tape-spawn'),
    tarifa = require('../helpers').cmd,
    catValues = require('../helpers').catValues,
    format = require('util').format;

test('tarifa create', function (t) {
    var vals = catValues(),
        st = spawn(t, tarifa(format('create --path %s --id %s --name %s', vals.tmpPath, vals.id, vals.name)));
    st.exitCode(0);
    st.end();
});
