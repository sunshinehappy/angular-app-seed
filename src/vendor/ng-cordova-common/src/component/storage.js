angular.module('common.component').factory('common.component.storage', [
    '$q',
    'common.util.logger',
    function($q, logger) {

        var storage_config = {
            prefix: '_eve_',
            default_expire_mins: 30,
            driver: [
                localforage.INDEXEDDB,
                localforage.WEBSQL,
                localforage.LOCALSTORAGE
            ]
        };

        var _mem_storage = {};

        var get_from_storage = function(now, key) {
            var deferred = $q.defer();
            localforage.getItem(storage_config.prefix + key, function(err, value) {
                if (err || !value) {
                    deferred.reject();
                    return false;
                }
                var storage_data = value;
                var expire_at = Number(storage_data.expire_at);
                if (!isNaN(expire_at) && expire_at > now) {
                    var obj = {
                        expire_at: expire_at,
                        data: storage_data.data
                    };
                    _mem_storage[key] = obj;
                    deferred.resolve(obj.data);
                } else {
                    eStorage.remove(key).then(function() {
                        deferred.reject();
                    }, function() {
                        deferred.reject();
                    });
                }
            });
            return deferred.promise;
        };

        var eStorage = {
            INDEXEDDB: localforage.INDEXEDDB,
            WEBSQL: localforage.WEBSQL,
            LOCALSTORAGE: localforage.LOCALSTORAGE,
            config: function(options) {
                if (typeof options === 'object') {
                    angular.forEach(options, function(value, key) {
                        storage_config[key] = value;
                    });
                } else {
                    logger.error("storage config options not object");
                }
                localforage.config({
                    driver: storage_config.driver
                });
            },
            get: function(key) {
                var deferred = $q.defer();
                var now = Date.now();
                var mem_obj = _mem_storage[key];
                if (mem_obj) {
                    if (mem_obj.expire_at > now) {
                        deferred.resolve(mem_obj.data);
                    } else {
                        eStorage.remove(key).then(function() {
                            deferred.reject();
                        }, function() {
                            deferred.reject();
                        });
                    }
                    return deferred.promise;
                }
                return get_from_storage(now, key);
            },
            set: function(key, data, expire) {
                var deferred = $q.defer();
                if (!data) {
                    logger.warn('avoiding putting undefined or null value into storage, key=', key);
                    deferred.reject();
                    return deferred.promise;
                }
                expire = Number(expire);
                expire = (!isNaN(expire) && expire > 0) ? expire : storage_config.default_expire_mins;
                var now = Date.now();
                var expire_at = now + (expire * 1000 * 60);
                _mem_storage[key] = {
                    expire_at: expire_at,
                    data: data
                };
                localforage.setItem(storage_config.prefix + key, {
                    expire_at: expire_at,
                    data: data
                }, function(err, value) {
                    if (err) {
                        deferred.reject();
                    } else {
                        deferred.resolve(data);
                    }
                });
                return deferred.promise;
            },
            update: function(key, new_data) {
                var deferred = $q.defer();
                var now = Date.now();
                localforage.getItem(storage_config.prefix + key, function(err, value) {
                    if (err || !value) {
                        deferred.reject();
                        return false;
                    }
                    var storage_data = value;
                    var expire_at = Number(storage_data.expire_at);
                    if (!isNaN(expire_at) && expire_at > now) {
                        var obj = {
                            expire_at: expire_at,
                            data: new_data
                        };
                        _mem_storage[key] = obj;
                        localforage.setItem(storage_config.prefix + key, obj, function(err, value) {
                            if (err) {
                                deferred.reject();
                            } else {
                                deferred.resolve(new_data);
                            }
                        });
                    } else {
                        eStorage.remove(key).then(function() {
                            deferred.reject();
                        }, function() {
                            deferred.reject();
                        });
                    }
                });
                return deferred.promise;
            },
            remove: function(key) {
                var deferred = $q.defer();
                _mem_storage[key] = undefined;
                localforage.removeItem(storage_config.prefix + key, function(err) {
                    if (err) {
                        deferred.reject();
                    }
                    deferred.resolve();
                });
                return deferred.promise;
            },
            clear: function() {
                    var deferred = $q.defer();
                    localforage.clear(function(err) {
                        if (err) {
                            deferred.reject();
                        } else {
                            _mem_storage = {}
                            deferred.resolve();
                        }
                    });
                    return deferred.promise;
                }
                // clearByType: function(typeStr) {
                //     var deferred = $q.defer();
                //     try {
                //         localforage.keys(function(err, lkeys) {
                //             lkeys.forEach(function(key) {
                //                 var index;
                //                 index = key.indexOf(storage_config.prefix);
                //                 if (index === -1) {
                //                     return;
                //                 }
                //                 index = key.indexOf(storage_config.user_suffix);
                //                 if (index !== -1) {
                //                     return;
                //                 }
                //                 remove(key);
                //             });
                //         });
                //     } catch (e) {
                //         deferred.reject();
                //     }
                //     deferred.resolve();
                //     return deferred.promise;
                // }
        };

        return eStorage;
    }
]);
