function countOptions(args){
    var i=0;
    for(var prop in args) {
        if(args.hasOwnProperty(prop)) i++;
    }
    return i;
}

function matchSingleOption(args, s, l) {
    return matchOption(args, s, l) && countOptions(args) === 2;
}

function matchSingleOptionWithArguments(args, s, l, allowedNumbers) {
    return matchOption(args, s, l) && countOptions(args) === 2 && allowedNumbers.indexOf(args._.length) > -1;
}

function matchArgumentsCount(args, allowedNumbers) {
    return allowedNumbers.indexOf(args._.length) > -1;
}

function matchOption(args, s, l) {
    return args[s] === true || args[l] === true;
}

function matchOptionWithValue(args, s, l) {
    return args[s] !== undefined || args[l] !== undefined;
}

function checkValidOptions(args, optionNames) {
    for(var prop in args) {
        if(prop !== '_' && optionNames.indexOf(prop) < 0) return false;
    }
    return true;
}

function matchWildcard(str) {
  return str && /^[^\s]+$/.exec(str);
}

function getFromWildcard(wildcard) {
  var m = matchWildcard(wildcard);
  return m && m[0] && m[0].split(',').map(function (e) {
    return e.trim();
  });
}

function matchMulti(str) {
  var m = matchWildcard(str);
  return m && m[0] && (m[0].split(',').length > 1 || m[0] === 'all');
}

/*
 * Match command args
 *
 * @param _ {Array} argv._
 * @param expected {Array} Args to match. Can use expected arg string or wildcards.
 *
 * Possible wildcards are :
 * - '*': match any or none
 * - '+': match some
 * - '__all__': match 'all' (all platforms or confs)
 * - '__some__': match 'xxx,yyy[,zzz]' where xxx, yyy, zzz are configurations
 *   or platforms.
 *
 * @return {boolean}
 */
function matchCmd(_, expected) {
    if(_.length > expected.length) return false;
    return expected.reduce(function(matched, argMask, idx) {
        var cliArg = _[idx];
        if(!matched) return matched;
        if(argMask === '*') return matched;
        if(argMask === '+' && cliArg) return matched;
        if(argMask === '__all__' && cliArg === 'all') return matched;
        if(argMask === '__some__' && matchWildcard(cliArg)) return matched;
        if(argMask === '__multi__' && matchMulti(cliArg)) return matched;
        if(argMask === cliArg) return matched;
        return !matched;
    }, true);
}

exports.matchSingleOption = matchSingleOption;
exports.matchOption = matchOption;
exports.matchOptionWithValue = matchOptionWithValue;
exports.countOptions = countOptions;
exports.matchArgumentsCount = matchArgumentsCount;
exports.matchSingleOptionWithArguments = matchSingleOptionWithArguments;
exports.checkValidOptions = checkValidOptions;
exports.matchCmd = matchCmd;
exports.matchWildcard = matchWildcard;
exports.getFromWildcard = getFromWildcard;
