// Generated by CoffeeScript 1.9.1
var Account, Contact, CozyInstance, ImapReporter, Settings, async, log;

CozyInstance = require('../models/cozy_instance');

ImapReporter = require('../imap/reporter');

Account = require('../models/account');

Contact = require('../models/contact');

Settings = require('../models/settings');

async = require('async');

log = require('../utils/logging')({
  prefix: 'controllers:index'
});

module.exports.main = function(req, res, next) {
  return async.series([
    Settings.get, CozyInstance.getLocale, Account.clientList, function(callback) {
      return Contact.requestWithPictures('all', {}, callback);
    }
  ], function(err, results) {
    var accounts, contacts, imports, locale, refreshes, settings;
    refreshes = ImapReporter.summary();
    if (err) {
      console.log(err);
      console.trace();
      log.error(err.stack);
      imports = "console.log(\"" + err + "\");\nwindow.locale = \"en\"\nwindow.refreshes = []\nwindow.accounts  = []\nwindow.contacts  = []";
    } else {
      settings = results[0], locale = results[1], accounts = results[2], contacts = results[3];
      imports = "window.settings  = " + (JSON.stringify(settings)) + "\nwindow.refreshes = " + (JSON.stringify(refreshes)) + ";\nwindow.locale    = \"" + locale + "\";\nwindow.accounts  = " + (JSON.stringify(accounts)) + ";\nwindow.contacts  = " + (JSON.stringify(contacts)) + ";";
    }
    return res.render('index.jade', {
      imports: imports
    });
  });
};

module.exports.loadFixtures = function(req, res, next) {
  var e, fixtures;
  try {
    fixtures = require('cozy-fixtures');
  } catch (_error) {
    e = _error;
    return next(new Error('only in tests'));
  }
  return fixtures.load({
    silent: true,
    callback: function(err) {
      if (err) {
        return next(err);
      } else {
        return res.send(200, {
          message: 'LOAD FIXTURES SUCCESS'
        });
      }
    }
  });
};

module.exports.refresh = function(req, res, next) {
  var limit, onlyFavorites, ref;
  if ((ref = req.query) != null ? ref.all : void 0) {
    limit = void 0;
    onlyFavorites = false;
  } else {
    limit = 1000;
    onlyFavorites = true;
  }
  return Account.refreshAllAccounts(limit, onlyFavorites, function(err) {
    if (err) {
      log.error("REFRESHING ACCOUNT FAILED", err);
    }
    if (err) {
      return next(err);
    }
    return res.send(200, {
      refresh: 'done'
    });
  });
};

module.exports.refreshes = function(req, res, next) {
  return res.send(200, ImapReporter.summary());
};
