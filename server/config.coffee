path = require 'path'
americano = require 'americano'
log = require('./utils/logging')(prefix: 'config')
sharedSession = require 'shared-cookie-session'

global.MODEL_MODULE = 'cozy-db-pouchdb'

{errorHandler} = require './utils/errors'

config =
    common:
        set:
            'view engine': 'jade'
            'views': path.resolve __dirname, 'views'
        use: [
            americano.bodyParser()
            americano.methodOverride()
            americano.static __dirname + '/../client/public',
                maxAge: 86400000
            sharedSession.cookieSession
            sharedSession.processSession
            ((req, res, next) ->
                 console.log req.session
                 if req.path is '/account'
                     req.session.user = 'admin'
                     return next()
                 if not req.session?.user?
                     res.end "Please log in first."
                     log.info "redir to login"
                 else
                     log.info 'user='+req.session.user
                     console.log 'user=', req.session.user
                     next()
            )
        ]

        afterStart: (app, server) ->
            app.use errorHandler
            SocketHandler = require './utils/socket_handler'
            SocketHandler.setup app, server
            Account = require './models/account'
            Account.removeOrphansAndRefresh null, false, ->
                log.info "initial refresh completed"

    development: [
        americano.logger 'dev'
    ]

    production: [
        americano.logger 'short'
    ]

    plugins: [
        MODEL_MODULE
    ]

require MODEL_MODULE
#config.plugins = [ 'americano-cozy-pouchdb-multi', 'multi-emails' ]
#require('multi-emails')

module.exports = config
