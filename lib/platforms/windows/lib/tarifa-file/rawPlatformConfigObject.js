var uuid = require('uuid');

module.exports = function (conf, obj, o) {
    o[conf].guid = uuid.v4();
    return o;
};