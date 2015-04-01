// Generated by CoffeeScript 1.9.1
var BadRequest, Contact, ContactActivity, NotFound, async, includePictures, log, ref;

Contact = require('../models/contact');

async = require('async');

log = require('../utils/logging')({
  prefix: 'controllers:activity'
});

ref = require('../utils/errors'), BadRequest = ref.BadRequest, NotFound = ref.NotFound;

includePictures = function(contacts, callback) {
  return async.eachSeries(contacts, function(contact, cb) {
    var bufs, ref1, stream;
    if ((ref1 = contact._attachments) != null ? ref1.picture : void 0) {
      stream = contact.getFile('picture', function(err) {
        if (err != null) {
          return log.error(err);
        }
      });
      bufs = [];
      stream.on('data', function(d) {
        return bufs.push(d);
      });
      return stream.on('end', function() {
        var avatar, buf;
        buf = Buffer.concat(bufs);
        avatar = "data:image/jpeg;base64," + buf.toString('base64');
        contact.datapoints.push({
          name: 'avatar',
          value: avatar
        });
        return cb(null, contact);
      });
    } else {
      return cb(null, contact);
    }
  }, callback);
};

ContactActivity = {
  search: function(data, callback) {
    var params, request;
    if (data.query != null) {
      request = 'byName';
      params = {
        startkey: data.query,
        endkey: data.query + "\uFFFF"
      };
    } else {
      request = 'all';
      params = {};
    }
    return Contact.requestWithPictures(request, params, callback);
  },
  create: function(data, callback) {
    var ref1;
    if (((ref1 = data.contact) != null ? ref1.address : void 0) != null) {
      return Contact.createNoDuplicate(data.contact, callback);
    } else {
      return callback(new BadRequest('BAD FORMAT'));
    }
  },
  "delete": function(data, callback) {
    return Contact.find(data.id, function(err, contact) {
      if (err) {
        return callback(err);
      }
      if (!contact) {
        return callback(new NotFound("CONTACT " + data.id));
      }
      return contact.destroy(callback);
    });
  }
};

module.exports.create = function(req, res, next) {
  var activity;
  activity = req.body;
  switch (activity.data.type) {
    case 'contact':
      if (ContactActivity[activity.name] != null) {
        return ContactActivity[activity.name](activity.data, function(err, result) {
          if (err != null) {
            return res.send(400, {
              name: err.message,
              error: true
            });
          } else {
            return res.send(200, {
              result: result
            });
          }
        });
      } else {
        return res.send(400, {
          name: "Unknown activity name",
          error: true
        });
      }
      break;
    case 'error':
      log.error(activity.data);
      return res.send(200, null);
    default:
      return res.send(400, {
        name: "Unknown activity data type",
        error: true
      });
  }
};
