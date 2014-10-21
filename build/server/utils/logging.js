// Generated by CoffeeScript 1.7.1
var COLORS, LOG_LEVEL;

COLORS = ['\x1B[32mDBUG\x1B[39m', '\x1B[34mINFO\x1B[39m', '\x1B[33mWARN\x1B[39m', '\x1B[31mEROR\x1B[39m'];

LOG_LEVEL = process.env.DEBUG_LEVEL != null ? parseInt(process.env.DEBUG_LEVEL) : process.env.NODE_ENV === 'test' ? 3 : process.env.NODE_ENV === 'production' ? 1 : 0;

module.exports = function(options) {
  var api, logger, prefix;
  prefix = typeof options === 'string' ? options : options.prefix;
  logger = function(level) {
    return function() {
      var arg, args, i, _i, _len;
      if (level < LOG_LEVEL) {
        return null;
      }
      args = new Array(arguments.length + 2);
      args[0] = COLORS[level];
      args[1] = prefix;
      for (i = _i = 0, _len = arguments.length; _i < _len; i = ++_i) {
        arg = arguments[i];
        args[i + 2] = arg;
      }
      return console.log.apply(console, args);
    };
  };
  return api = {
    debug: logger(0),
    info: logger(1),
    warn: logger(2),
    error: logger(3)
  };
};