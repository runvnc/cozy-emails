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
        ]

        afterStart: (app, server) ->
            # move it here needed after express 4.4
            sharedSession.setupAppServer app
            app.use errorHandler
            app.use (req, res, next) ->
                if not req.session?.user?
                    req.redirect req.protocol+'://'+req.get('host') + '/login'
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
