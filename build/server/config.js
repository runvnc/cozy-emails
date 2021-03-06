// Generated by CoffeeScript 1.9.1
var americano, config, errorHandler, log, path, sharedSession;

path = require('path');

americano = require('americano');

log = require('./utils/logging')({
  prefix: 'config'
});

sharedSession = require('shared-cookie-session');

global.MODEL_MODULE = 'cozy-db-pouchdb';

errorHandler = require('./utils/errors').errorHandler;

config = {
  common: {
    set: {
      'view engine': 'jade',
      'views': path.resolve(__dirname, 'views')
    },
    use: [
      americano.bodyParser(), americano.methodOverride(), americano["static"](__dirname + '/../client/public', {
        maxAge: 86400000
      }), sharedSession.cookieSession, sharedSession.processSession, (function(req, res, next) {
        var ref;
        console.log(req.session);
        if (req.path === '/account') {
          req.session.user = 'admin';
          return next();
        }
        if (((ref = req.session) != null ? ref.user : void 0) == null) {
          res.end("Please log in first.");
          return log.info("redir to login");
        } else {
          log.info('user=' + req.session.user);
          console.log('user=', req.session.user);
          return next();
        }
      })
    ],
    afterStart: function(app, server) {
      var Account, SocketHandler;
      app.use(errorHandler);
      SocketHandler = require('./utils/socket_handler');
      SocketHandler.setup(app, server);
      Account = require('./models/account');
      return Account.removeOrphansAndRefresh(null, false, function() {
        return log.info("initial refresh completed");
      });
    }
  },
  development: [americano.logger('dev')],
  production: [americano.logger('short')],
  plugins: [MODEL_MODULE]
};

require(MODEL_MODULE);

module.exports = config;
