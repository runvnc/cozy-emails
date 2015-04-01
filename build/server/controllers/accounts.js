// Generated by CoffeeScript 1.9.1
var Account, AccountConfigError, HttpError, NotFound, _, async, log, ref;

_ = require('lodash');

Account = require('../models/account');

ref = require('../utils/errors'), AccountConfigError = ref.AccountConfigError, HttpError = ref.HttpError, NotFound = ref.NotFound;

log = require('../utils/logging')({
  prefix: 'accounts:controller'
});

NotFound = require('../utils/errors').NotFound;

async = require('async');

module.exports.fetch = function(req, res, next) {
  var id;
  id = req.params.accountID || req.body.accountID || req.mailbox.accountID || req.message.accountID;
  return Account.find(id, function(err, found) {
    if (err) {
      return next(new HttpError(404, err));
    }
    if (!found) {
      return next(new NotFound("Acccount " + id));
    }
    req.account = found;
    return next();
  });
};

module.exports.format = function(req, res, next) {
  log.info("FORMATTING ACCOUNT");
  return res.account.toClientObject(function(err, formated) {
    log.info("SENDING ACCOUNT");
    if (err) {
      return next(err);
    }
    return res.send(formated);
  });
};

module.exports.formatList = function(req, res, next) {
  return async.mapSeries(res.accounts, function(account, callback) {
    return account.toClientObject(callback);
  }, function(err, formateds) {
    if (err) {
      return next(err);
    }
    return res.send(formateds);
  });
};

module.exports.create = function(req, res, next) {
  var data;
  data = req.body;
  return Account.createIfValid(data, function(err, created) {
    if (err) {
      return next(err);
    }
    res.account = created;
    next();
    return res.account.imap_fetchMailsTwoSteps(function(err) {
      if (err) {
        return log.error("FETCH MAIL FAILED", err.stack || err);
      }
    });
  });
};

module.exports.check = function(req, res, next) {
  return Account.checkParams(req.body, function(err) {
    if (err) {
      return next(err);
    }
    return res.send(200);
  });
};

module.exports.list = function(req, res, next) {
  return Account.request('all', function(err, founds) {
    if (err) {
      return next(err);
    }
    res.accounts = founds;
    return next();
  });
};

module.exports.edit = function(req, res, next) {
  return Account.checkParams(req.body, function(err) {
    var changes;
    if (err) {
      return next(err);
    }
    changes = _.pick(req.body, 'label', 'login', 'password', 'name', 'account_type', 'smtpServer', 'smtpPort', 'smtpSSL', 'smtpTLS', 'imapServer', 'imapPort', 'imapSSL', 'imapTLS', 'draftMailbox', 'sentMailbox', 'trashMailbox');
    return req.account.updateAttributes(changes, function(err, updated) {
      res.account = updated;
      return next(err);
    });
  });
};

module.exports.remove = function(req, res, next) {
  return req.account.destroyEverything(function(err) {
    if (err) {
      return next(err);
    }
    return res.send(204);
  });
};
