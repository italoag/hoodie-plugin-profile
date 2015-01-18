var async = require('async'),
    utils = require('hoodie-utils-plugins')('profile:db'),
    ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI;

module.exports = function (hoodie, dbname) {

  /**
   * Profile _dbname
   */

  var db = new ExtendedDatabaseAPI(hoodie, hoodie.database(dbname));

  /**
   * Profile dbAdd
   */

  var dbAdd = function (hoodie, callback) {
    hoodie.database.add(dbname, function (err) {
      callback(err);
    });
  };

  var addLookupByUserName = function (hoodie, callback) {

    var index = {
      map: function (doc) {
        if (doc.username)
          emit(doc.username, doc.hoodieId);
      }
    };

    db.addIndex('by_username', index, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };

  /**
   * Profile userFilter
   */

  db.userFilter = function (hoodie, userDb, callback) {
    var filterFunction = function (doc, req) {
      if (doc.type === req.query.type) {
        return true;
      } else {
        return false;
      }
    };

    userDb.addFilter('by_type', filterFunction, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };


 

  async.series([
    async.apply(dbAdd, hoodie),
    async.apply(addLookupByUserName, hoodie)
  ],
  function (err) {
    if (err) {
      console.error(
        'setup db error() error:\n' + (err.stack || err.message || err.toString())
      );
    }
  });

  return db;
};