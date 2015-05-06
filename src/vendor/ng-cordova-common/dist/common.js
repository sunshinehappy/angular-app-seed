angular.module('common.util', []);
angular.module('common.component', []);
angular.module('common', ['common.util', 'common.component']);

/**
 * config service
 */

angular.module("common").factory('common.config', function() {

    var config = {
        auth_expire : 60 * 24 * 60, /*60 days*/
        version : 'Test',
        release_time : 'Test',
        // xinge notification:
        xinge_access_id : '2100054419',
        xinge_access_key : 'A88UQ5P3F7DM'
    };

    if (typeof window.local_config === 'object') {
        for (var attr in window.local_config) {
            config[attr] = window.local_config[attr];
        }
    }

    return config;

});

angular.module('common.util').factory('common.util.core', function () {

    var regEmail = /\S+@\S+\.\S+/;
    var regPhone = /^(1[3|4|5|7|8]\d{9})|((\d{3,4}-?)?\d{7,8})$/;
    var regTelPhone = /^(\d{3,4}-?)?\d{7,8}$/;
    var regMobilePhone = /^1[3|4|5|7|8]\d{9}$/;

    var core = {

        isEmail: function (val) {
            return regEmail.test(val);
        },

        isPhone: function (val) {
            return regPhone.test(val);
        },

        isTelPhone: function (val) {
            return regTelPhone.test(val);
        },

        isMobilePhone: function (val) {
            return regMobilePhone.test(val);
        },

        safeRun: function () {
            try {
                var args = Array.prototype.slice.call(arguments, 0);
                var func = args.shift();
                try {
                    return func.apply(window, args);
                } catch (e) {
                    logger.error('safe run failed. func =', func.name, ',name=', func.displayName, ' message=', e.message, e.stack);
                }
            } catch (e) {
                logger.error('safe run failed to process arguments. message=', e.message, e.stack);
            }
        },

        safeCall: function () {
            try {
                var args = Array.prototype.slice.call(arguments, 0);
                var this_pointer = args.shift();
                var func = args.shift();
                try {
                    return func.apply(this_pointer, args);
                } catch (e) {
                    logger.error('safe call failed. message=', e.message, e.stack);
                }
            } catch (e) {
                logger.error('safe call failed to process arguments. message=', e.message, e.stack);
            }
        },

        /**
         * clone object
         * @param o object
         * @param d 是否深克隆
         * @returns {*}
         */
        clone: function (o, d) {
            if ( o === null || o === undefined || typeof ( o ) !== 'object' )
            {
                return o;
            }

            var deep = !!d;

            var cloned;

            if ( o.constructor === Array )
            {
                if ( deep === false )
                {
                    return o;
                }

                cloned = [];

                for ( var i in o )
                {
                    cloned.push( core.clone( o[i], deep ) );
                }

                return cloned;
            }

            cloned = {};

            for ( var i in o )
            {
                cloned[i] = deep ? core.clone( o[i], true ) : o[i];
            }

            return cloned;
        }

    };

    return core;

});

//for test
angular.module('common.util').factory('common.util.device', [

    function () {

        var DEVICE_TYPE_UNKNOWN = 0;
        var DEVICE_TYPE_IOS = 1;
        var DEVICE_TYPE_ANDROID = 2;

        var _isCordova, _isAndroid, _isIOS;

        var Device = function () {

            this.uuid = 'unknown_' + Math.floor(Date.now() * Math.random());

            this.platform = '';

            try {
                this.uuid = window.device.uuid;
                this.platform = window.device.platform;
            } catch (err) {

            }

            this.isPhonegap = function () {
                if (typeof(_isCordova) === 'undefined') {
                    _isCordova = (typeof(cordova) !== 'undefined' || typeof(phonegap) !== 'undefined');
                }
                return _isCordova;
            };

            this.isCordova = function () {
                if (typeof(_isCordova) === 'undefined') {
                    _isCordova = (typeof(cordova) !== 'undefined' || typeof(phonegap) !== 'undefined');
                }
                return _isCordova;
            };

            this.isAndroid = function () {
                if (typeof(_isAndroid) === 'undefined') {
                    _isAndroid = navigator.userAgent.indexOf('Android') > -1;
                }
                return _isAndroid;
            };

            this.isIOS = function () {
                if (typeof(_isIOS) === 'undefined') {
                    _isIOS = /iP(ad|hone|od)/.test(navigator.userAgent);
                }
                return _isIOS;
            };

            this.getType = function () {
                if (this.platform.toLowerCase() === 'ios') {
                    return DEVICE_TYPE_IOS;
                } else if (this.platform.toLowerCase() === 'android') {
                    return DEVICE_TYPE_ANDROID;
                } else {
                    return DEVICE_TYPE_UNKNOWN;
                }
            };

        };

        return new Device();

    }
]);

angular.module("common.util").factory('common.util.file', [
    '$q',
    'common.util.device',
    'common.util.logger',
    function ($q, device, logger) {

        var file = {

            upload : function (file_url, server_url, options) {

                return $q(function (resolve, reject) {

                    if (!device.isCordova()) {
                        reject();
                        return false;
                    }
                    var file_options = new FileUploadOptions();

                    var fileName = file_url.substr(file_url.lastIndexOf('/') + 1);
                    file_options.fileKey = options.fileKey ? options.fileKey : 'file';
                    file_options.fileName = fileName ? fileName : 'image.jpg';
                    file_options.mimeType = options.mimeType ? options.mimeType : 'image/jpeg';
                    file_options.params = options.params ? options.params : {};
                    file_options.chunkedMode = options.chunkedMode ? options.chunkedMode : true;
                    file_options.headers = options.headers ? options.headers : {};

                    var ft = new FileTransfer();

                    ft.upload(file_url, server_url, function (req) {
                        resolve(req);
                    }, function (error) {
                        reject(error);
                    }, file_options);

                }).then(function (r) {
                    try {
                        navigator.camera.cleanup();
                    } catch (e) {
                        logger.error(e.message, e.stack);
                    }
                    var response = r.response ? JSON.parse(r.response) : '';
                    logger.log("Code = " + r.responseCode);
                    logger.log("Response = " + r.response);
                    logger.log("Sent = " + r.bytesSent);
                    return response;
                });
            }
        };

        return file;

    }
]);
angular.module("common.util").factory('common.util.http',
    [
        '$http',
        '$q',
        function ($http, $q) {

            var myQ = function (func) {
                var deferred = $q.defer();
                try {
                    func(deferred.resolve, deferred.reject);
                } catch (e) {
                    deferred.reject(e);
                }
                return deferred.promise;
            };

            function parse_http_data (data) {
                if (typeof data !== 'object') {
                    return null;
                }
                var keys = [];
                for (var key in data) {
                    keys.push(key);
                }
                keys.sort(function (a, b) {
                    return a.localeCompare(b);
                });

                var str = [];
                keys.forEach(function (e) {
                    str.push(encodeURIComponent(e) + "=" + encodeURIComponent(data[e]));
                });
                return str.join("&");
            }

            function config_http_options (options) {
                if (!options) {
                    return http.options;
                }
                var defaults = angular.copy(http.options);
                var defaultHeaders = angular.copy(defaults.headers);
                angular.extend(defaults, options);
                if (options.headers) {
                    angular.extend(defaultHeaders, options.headers);
                    defaults.headers = defaultHeaders;
                }
                if (typeof defaults.requestIntercept !== 'function') {
                    defaults.requestIntercept = http.defaults.requestIntercept;
                }
                if (typeof defaults.responseIntercept !== 'function') {
                    defaults.responseIntercept = http.defaults.responseIntercept;
                }
                if (typeof defaults.errorIntercept !== 'function') {
                    defaults.errorIntercept = http.defaults.errorIntercept;
                }
                return defaults;
            }

            var http = function (options) {

                return $q.when(options).then(options.requestIntercept).then(function (options) {
                    if (options.local === true) {
                        options.method = 'GET';
                    } else {
                        options.url = options.origin + options.url;
                    }
                    if (options.method == 'PUT' || options.method == 'POST') {
                        options.data = parse_http_data(options.data);
                    }
                    options.headers.HTTP_TIMESTAMP = Date.now();
                    return options;
                }).then($http).then(options.responseIntercept).catch(options.errorIntercept);

            };

            http.get = function (relativeUrl, config) {
                var options = config_http_options(config);
                options.method = 'GET';
                options.url = relativeUrl;
                return http(options);
            };
            http.delete = function (relativeUrl, config) {
                var options = config_http_options(config);
                options.method = 'DELETE';
                options.url = relativeUrl;
                return http(options);
            };
            http.post = function (relativeUrl, data, config) {
                var options = config_http_options(config);
                options.method = 'POST';
                options.url = relativeUrl;
                options.data = data;
                return http(options);
            };
            http.put = function (relativeUrl, data, config) {
                var options = config_http_options(config);
                options.method = 'PUT';
                options.url = relativeUrl;
                options.data = data;
                return http(options);
            };

            //原始 的 配置
            http.defaults = {
                requestIntercept: function (request) {
                    return request;
                },
                responseIntercept: function (response) {
                    return response;
                },
                errorIntercept: function (err) {
                    return $q.reject(err);
                }
            };

            http.options = {
                timeout: 7000,
                requestIntercept: http.defaults.requestIntercept,
                responseIntercept: http.defaults.responseIntercept,
                errorIntercept: http.defaults.errorIntercept,
                origin: '',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    HTTP_SIGNATURE: 'not_implemented'
                }
            };

            http.config = function (options) {
                http.options = config_http_options(options);
            };

            return http;

        }
    ]
);

angular.module('common.util').factory('common.util.logger', function () {

    window.logger = window.console || {
        log: function () {

        },
        warn: function () {

        },
        error: function () {

        }
    };

    return window.logger;

});


/*
 * JavaScript MD5 1.0.1
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*jslint bitwise: true */
/*global unescape, define */

angular.module('common.util').factory('common.util.md5', function() {

    var md5 = (function ($) {
        'use strict';

        /*
         * Add integers, wrapping at 2^32. This uses 16-bit operations internally
         * to work around bugs in some JS interpreters.
         */
        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        /*
         * Bitwise rotate a 32-bit number to the left.
         */
        function bit_rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        /*
         * These functions implement the four basic operations the algorithm uses.
         */
        function md5_cmn(q, a, b, x, s, t) {
            return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
        }
        function md5_ff(a, b, c, d, x, s, t) {
            return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }
        function md5_gg(a, b, c, d, x, s, t) {
            return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }
        function md5_hh(a, b, c, d, x, s, t) {
            return md5_cmn(b ^ c ^ d, a, b, x, s, t);
        }
        function md5_ii(a, b, c, d, x, s, t) {
            return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        /*
         * Calculate the MD5 of an array of little-endian words, and a bit length.
         */
        function binl_md5(x, len) {
            /* append padding */
            x[len >> 5] |= 0x80 << (len % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            var i, olda, oldb, oldc, oldd,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

            for (i = 0; i < x.length; i += 16) {
                olda = a;
                oldb = b;
                oldc = c;
                oldd = d;

                a = md5_ff(a, b, c, d, x[i],       7, -680876936);
                d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
                c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
                b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
                a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
                d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
                c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
                b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
                a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
                d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
                c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
                d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

                a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
                d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
                c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
                b = md5_gg(b, c, d, a, x[i],      20, -373897302);
                a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
                d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
                c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
                a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
                d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
                c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
                b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
                a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
                d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
                c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
                b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

                a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
                d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
                c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
                b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
                d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
                c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
                b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
                d = md5_hh(d, a, b, c, x[i],      11, -358537222);
                c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
                b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
                a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
                d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
                b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

                a = md5_ii(a, b, c, d, x[i],       6, -198630844);
                d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
                c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
                a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
                d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
                c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
                a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
                d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
                b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
                a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
                d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
                b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

                a = safe_add(a, olda);
                b = safe_add(b, oldb);
                c = safe_add(c, oldc);
                d = safe_add(d, oldd);
            }
            return [a, b, c, d];
        }

        /*
         * Convert an array of little-endian words to a string
         */
        function binl2rstr(input) {
            var i,
            output = '';
            for (i = 0; i < input.length * 32; i += 8) {
                output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
            }
            return output;
        }

        /*
         * Convert a raw string to an array of little-endian words
         * Characters >255 have their high-byte silently ignored.
         */
        function rstr2binl(input) {
            var i,
            output = [];
            output[(input.length >> 2) - 1] = undefined;
            for (i = 0; i < output.length; i += 1) {
                output[i] = 0;
            }
            for (i = 0; i < input.length * 8; i += 8) {
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
            }
            return output;
        }

        /*
         * Calculate the MD5 of a raw string
         */
        function rstr_md5(s) {
            return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
        }

        /*
         * Calculate the HMAC-MD5, of a key and some data (raw strings)
         */
        function rstr_hmac_md5(key, data) {
            var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
            ipad[15] = opad[15] = undefined;
            if (bkey.length > 16) {
                bkey = binl_md5(bkey, key.length * 8);
            }
            for (i = 0; i < 16; i += 1) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }
            hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
            return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
        }

        /*
         * Convert a raw string to a hex string
         */
        function rstr2hex(input) {
            var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
            for (i = 0; i < input.length; i += 1) {
                x = input.charCodeAt(i);
                output += hex_tab.charAt((x >>> 4) & 0x0F) +
                    hex_tab.charAt(x & 0x0F);
            }
            return output;
        }

        /*
         * Encode a string as utf-8
         */
        function str2rstr_utf8(input) {
            return unescape(encodeURIComponent(input));
        }

        /*
         * Take string arguments and return either raw or hex encoded strings
         */
        function raw_md5(s) {
            return rstr_md5(str2rstr_utf8(s));
        }
        function hex_md5(s) {
            return rstr2hex(raw_md5(s));
        }
        function raw_hmac_md5(k, d) {
            return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
        }
        function hex_hmac_md5(k, d) {
            return rstr2hex(raw_hmac_md5(k, d));
        }

        function md5(string, key, raw) {
            if (!key) {
                if (!raw) {
                    return hex_md5(string);
                }
                return raw_md5(string);
            }
            if (!raw) {
                return hex_hmac_md5(key, string);
            }
            return raw_hmac_md5(key, string);
        }

        if (typeof define === 'function' && define.amd) {
            define(function () {
                return md5;
            });
        } else {
            $.md5 = md5;
        }
        return md5;
    }(this));

    return md5;
});

/*  
*   
*   Usage: var gcjloc = transformFromWGSToGCJ(lng,lat);
*   Source: https://github.com/hiwanz/wgs2mars.js.git
*/

angular.module('common.util').factory('common.util.wgs2mars',
function () {

    var PI = 3.14159265358979324;
    // Krasovsky 1940
    //
    // a = 6378245.0, 1/f = 298.3
    // b = a * (1 - f)
    // ee = (a^2 - b^2) / a^2;
    var a = 6378245.0;
    var ee = 0.00669342162296594323;

    function Rectangle(lng1, lat1, lng2, lat2) {
        this.west = Math.min(lng1, lng2);
        this.north = Math.max(lat1, lat2);
        this.east = Math.max(lng1, lng2);
        this.south = Math.min(lat1, lat2);
    }

    function isInRect(rect, lon, lat) {
        return rect.west <= lon && rect.east >= lon && rect.north >= lat && rect.south <= lat;
    }
    //China region - raw data
    var region = [
        new Rectangle(79.446200, 49.220400, 96.330000,42.889900),
        new Rectangle(109.687200, 54.141500, 135.000200, 39.374200),
        new Rectangle(73.124600, 42.889900, 124.143255, 29.529700),
        new Rectangle(82.968400, 29.529700, 97.035200, 26.718600),
        new Rectangle(97.025300, 29.529700, 124.367395, 20.414096),
        new Rectangle(107.975793, 20.414096, 111.744104, 17.871542)
    ];
    //China excluded region - raw data
    var exclude = [
        new Rectangle(119.921265, 25.398623, 122.497559, 21.785006),
        new Rectangle(101.865200, 22.284000, 106.665000, 20.098800),
        new Rectangle(106.452500, 21.542200, 108.051000, 20.487800),
        new Rectangle(109.032300, 55.817500, 119.127000, 50.325700),
        new Rectangle(127.456800, 55.817500, 137.022700, 49.557400),
        new Rectangle(131.266200, 44.892200, 137.022700, 42.569200)
    ];

    function isInChina(lon, lat) {
        for (var i = 0; i < region.length; i++) {
            if (isInRect(region[i], lon, lat))
            {
                for (var j = 0; j < exclude.length; j++)
                {
                    if (isInRect(exclude[j], lon, lat))
                    {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }

    function transformLat(x, y){
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
        return ret;
    }

    function transformLon(x, y){
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
        return ret;
    }

    // World Geodetic System ==> Mars Geodetic System
    function transform(wgLon,wgLat){
        var mgLoc = {};
        if (!isInChina(wgLon, wgLat)){
            mgLoc = {
                lat: wgLat,
                lng: wgLon
            };
            return mgLoc;
        }
        var dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
        var dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
        var radLat = wgLat / 180.0 * PI;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);
        mgLoc = {
            lat: wgLat + dLat,
            lng: wgLon + dLon
        };
            return mgLoc;
    }


    return {transformFromWGSToGCJ: transform};
});


angular.module('common.component').factory('common.component.eMap',
    [
    'common.util.wgs2mars',
    'common.util.core',
    'common.util.device',
    'common.util.logger',
    '$q',
    '$http',
    function (wgs2mars, core, device, logger, Q, $http) {

        // Geolocation 定位设置
        var SET_PARAMS = {maximumAge: 3000, timeout: 10000, enableHighAccuracy: true};
        // 默认设置：该设置不需要开放 zoom: 地图缩放级别 radius: 圆形覆盖半径
        var MAP_SETINGS = {zoom: 13, radius: 2000, strokeColor: 'rgba(150, 219, 94, 1)', fillColor: 'rgba(150, 219, 94, 0.59)'};
        var mapObj, marker, circle;

        // 初始化Amap
        function __initAmap(callback) {
            if (typeof AMap === 'undefined') {
                //jquery版本
                // $$.getJSON('http://webapi.amap.com/maps?v=1.3&key=d7fbf96818d5ca13faa47c9993951f9a' + '&callback=theFunctionName', {}, callback);
                
                // javascript版本
                window.onloadAMap = function () {
                    core.safeRun(callback);
                };
                var url = 'http://webapi.amap.com/maps?v=1.3&key=d7fbf96818d5ca13faa47c9993951f9a&callback=onloadAMap';
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;
                // script.onerror = function () {};
                // script.onload = function () {};
                document.querySelector('head').appendChild(script);
            } else {
                core.safeRun(callback);
            }
        }

        // 初始化地图对象，加载地图
        function __map(domId, location, zoom) {
            var deferred = Q.defer();
            __initAmap(function () {
                mapObj = new AMap.Map(domId, {
                        //二维地图显示视口
                        view: new AMap.View2D({
                            center: new AMap.LngLat(location.lng, location.lat),//地图中心点
                            zoom: zoom //地图显示的缩放级别
                        })
                    });
                console.log(mapObj);
                deferred.resolve(location);
            });
            return  deferred.promise;
        }

        // 逆编码
        function __geocoder(location, success_callback, error_callback) {
            __initAmap(function () {
                var lnglatXY = new AMap.LngLat(location.lng, location.lat);
                var MGeocoder;
                //加载地理编码插件
                AMap.service(['AMap.Geocoder'], function () {
                    MGeocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: 'all'
                    });
                    //逆地理编码
                    MGeocoder.getAddress(lnglatXY, function (status, result) {
                        // alert('成功调用逆地理编码');
                        if (status === 'complete' && result.info === 'OK') {
                            var ret = {
                                    message: '表示定位结果',
                                    code: 161,
                                    addr: result.regeocode.formattedAddress,
                                    coords: {
                                            radius: location.radius,
                                            longitude: location.lng,
                                            latitude: location.lat
                                        }
                                    };
                            if (typeof device !== 'undefined') {
                                ret.device = device;
                            } else {
                                ret.device = {type: 'brower'};
                            }
                            core.safeRun(success_callback, ret);
                        } else {
                            core.safeRun(error_callback, '未找到匹配地址');
                        }
                    });
                });
            });
        }

        // Location 定位
        function __geoLocation() {
            var deferred = Q.defer();
            var location = {};
            if (!device.isPhonegap() || device.isIOS()) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                    function (position) {
                        var gcjloc = wgs2mars.transformFromWGSToGCJ(position.coords.longitude, position.coords.latitude);
                        var location = {lng: parseFloat(gcjloc.lng.toFixed(7)), lat: parseFloat(gcjloc.lat.toFixed(7)), radius: parseFloat(position.coords.accuracy.toFixed(2))};
                        deferred.resolve({code: 1, msg: '获取地理定位成功', location: location});
                    },
                    function (error) {
                        console.log(error);
                        var errorMsg;
                        switch (error.code) {
                        case 1:
                            errorMsg = '您拒绝了系统定位的权限申请';
                            break;
                        case 2:
                            errorMsg = '无法获取到您所在的地理位置信息';
                            break;
                        case 3:
                            errorMsg = '获取地理位置信息超时';
                            break;
                        default:
                            errorMsg = '未知错误';
                            break;
                        }
                        deferred.reject({code: 0, msg: errorMsg, location: location });
                    },
                    SET_PARAMS);
                } else {
                    deferred.reject({code: 0, msg: '无法获取到您所在的地理位置信息', location: location});
                }
            }

            if (device.isAndroid()) {
                //通过百度sdk来获取经纬度,并且alert出经纬度信息
                var noop = function () {};
                window.plugins.locationService.getCurrentPosition(function (position) {
                    if (typeof device !== 'undefined') {
                        position.device = device;
                    } else {
                        position.device = {type: 'brower'};
                    }
                    var location = {lng: parseFloat(position.coords.longitude.toFixed(7)), lat: parseFloat(position.coords.latitude.toFixed(7)), radius: parseFloat(position.coords.radius.toFixed(2))};
                    deferred.resolve({code: 1, msg: '获取地理定位成功', location: location});
                    deferred.reject(position);
                    window.plugins.locationService.stop(noop, noop);
                }, function (e) {
                    deferred.reject({code: 0, msg: e.message, location: location});
                    window.plugins.locationService.stop(noop, noop);
                });
            }

            return deferred.promise;
        }

        // 绘制定位中心点
        function __marker(location) {
            var deferred = Q.defer();
            __initAmap(function () {
                marker = new AMap.Marker({
                        icon: "http://webapi.amap.com/images/marker_sprite.png",
                        position: new AMap.LngLat(location.lng, location.lat)
                    });
                marker.setMap(mapObj);  //在地图上添加点
                deferred.resolve(location);
            });
            return deferred.promise;
        }

        //添加圆形覆盖
        function __addCircle(location, radius) {
            var deferred = Q.defer();
            __initAmap(function () {
                circle = new AMap.Circle({ 
                    center: new AMap.LngLat(location.lng, location.lat),// 圆心位置
                    radius: radius, //半径
                    strokeColor: MAP_SETINGS.strokeColor, //线颜色
                    strokeOpacity: 1, //线透明度
                    strokeWeight: 2, //线粗细度
                    fillColor: MAP_SETINGS.fillColor, //填充颜色
                    fillOpacity: 0.35//填充透明度
                });
                circle.setMap(mapObj);
                deferred.resolve(location, radius);
            });
            return deferred.promise;
        }

        var eveMap = {

            /**
             *  获取地理位置
             *  success_callback, error_callback
             **/
            getLocation: function (success_callback, error_callback) {
                try {
                    if (!device.isPhonegap() || device.isIOS() || device.isAndroid()) {
                        __geoLocation().then(
                            function (ret) {
                                if (ret.code) {
                                    __geocoder(ret.location, success_callback, error_callback);
                                }
                            }, function (ret) {
                                core.safeRun(error_callback, ret.msg);
                            }
                        );
                    }
                } catch (e) {
                    logger.error(e.message, e.stack);
                    core.safeRun(error_callback, i18n.error.unknown_error);
                }
            },

            /**
             * 绘制带(定位 + 圆形覆盖)地图
             *  domId: html id (必须)
             *  success_callback, error_callback
             **/
            addMarker: function (domId, success_callback, error_callback) {
                try {
                    if (!device.isPhonegap() || device.isIOS() || device.isAndroid()) {
                        // 定位
                        __geoLocation().then(
                        function (ret) {
                            if (ret.code) {
                                // 初始化地图
                                __map(domId, ret.location, MAP_SETINGS.zoom).then(function (location) {
                                    // 绘制中心点
                                    __marker(location).then(
                                        function (location) {
                                            // 绘制圆形覆盖
                                            __addCircle(location, MAP_SETINGS.radius).then(function (location, radius) {
                                                core.safeRun(success_callback, location, MAP_SETINGS);
                                            });
                                        });
                                });
                            }
                        }, function (ret) {
                            core.safeRun(error_callback, ret.msg);
                        });
                    }
                } catch (e) {
                    console.log(e.message, e.stack);
                    core.safeRun(error_callback, i18n.error.unknown_error);
                }
            },
            
            /**
             * 更新圆形
             * location
             * radius: 半径/米
             **/
            updateCircle: function (location, radius) {
                try {
                    // 地图绘制失败
                    if (typeof AMap === 'undefined') return;
                    //新圆形属性
                    var circleoptions = {
                        center: new AMap.LngLat(location.lng, location.lat), //新圆心位置
                        radius: radius, //新半径
                        strokeColor: MAP_SETINGS.strokeColor, //线颜色
                        strokeOpacity: 1, //线透明度
                        strokeWeight: 2, //线粗细度
                        fillColor: MAP_SETINGS.fillColor, //填充颜色
                        fillOpacity: 0.35 //填充透明度
                    };
                    circle.setOptions(circleoptions); //更新圆属性
                    var zoom = 0;
                    if (radius >= 0 && radius <= 1000) {
                        zoom = 14;
                    } else if (radius > 1000 && radius <= 2500) {
                        zoom = 13;
                    } else if (radius > 2500 && radius <= 5000) {
                        zoom = 12;
                    } else if (radius > 5000 && radius <= 8000) {
                        zoom = 11;
                    } else {
                        zoom = 10;
                    }
                    mapObj.setZoomAndCenter(zoom, new AMap.LngLat(location.lng, location.lat));
                } catch (e) {
                    console.log(e.message, e.stack);
                }
            }
        };

        return eveMap;
    }
]);

angular.module("common.component").factory('common.component.notification',
    [
        'common.util.logger',
        'common.util.device',

        function (logger, device) {

            var CONFIG = {
                xinge_access_id: '',
                xinge_access_key: ''
            };

            var config_success_callback = function (data) {
                logger.info('notification config success');
            };

            var config_failed_callback = function (data) {
                logger.error('notification config failed. ', data);
            };

            var token_success_callback = function (data) {
                window.push_token = data;
                console.log('ios token success , data :' + data);
                // alert('ios token success , data :' + data);
            };

            var token_failed_callback = function (data) {
                //todo
                console.log('ios token failed , data :' + data);
                //alert('ios token failed , data :' + data);
                logger.error('notification config failed. ', data);
            };

            var open_callback = function (data) {
                logger.info('notification open callback invoked.');
                //alert('open:'+data)
            };

            var unregister_success = function (data) {
                logger.info('notification unregister success');
            };

            var unregister_failed = function (data) {
                logger.error('notification unregister failed. ', data);
            };

            var register_success = function (data) {
                logger.info('notification register success');
            };

            var register_failed = function (data) {
                logger.error('notification register failed. ', data);
            };

            var ios_badge_success = function (data) {
                logger.info('notification ios badge success.');
            };

            var ios_badge_failed = function (data) {
                logger.error('notification ios badge failed,', data);
            };


            function onNotificationAPN(event) {
                if (event.alert) {
                    navigator.notification.alert(event.alert);
                }
                if (event.sound) {
                    try {
                        var snd = new Media(event.sound);
                        snd.plat();
                    } catch (e) {
                        logger.warn('sound is not available');
                    }
                }

                if (event.badge) {
                    window.plugins.pushNotification.setApplicaionIconBadgeNumber(
                        ios_badge_success, ios_badge_failed, event.badge);
                }
            }

            function _register() {
                if (device.isIOS()) {
                    window.plugins.pushNotification.register(
                        token_success_callback,
                        token_failed_callback,
                        {
                            'badge': 'true',
                            'sound': 'true',
                            'alert': 'true',
                            'ecb': 'onNotificationAPN'
                        });

                } else if (device.isAndroid()) {
                    window.plugins.xingePlugin.config(
                        CONFIG.xinge_access_id,
                        CONFIG.xinge_access_key,
                        config_success_callback,
                        config_failed_callback
                    );
                    window.plugins.xingePlugin.register(unregister_success, unregister_failed);
                    window.plugins.xingePlugin.getToken(token_success_callback, token_failed_callback);
                    // window.plugins.xingePlugin.onNotificationClicked(open_callback, open_callback);

                } else {
                    logger.warn('doesnot support this platform:' + device.platform);
                }
            }

            function _unregister() {
                if (device.isIOS()) {
                    // FIXME: what does the options mean?
                    var options = 'nothing';
                    window.plugins.pushNotification.unregister(unregister_success, unregister_failed, options);
                } else if (device.isAndroid()) {
                    window.plugins.xingePlugin.unregister(unregister_success, unregister_failed);

                } else {
                    logger.warn('doesnot support this platform:' + device.platform);
                }
            }

            var notification = {

                init: function (options) {

                    if (!options) {
                        return false;
                    }
                    CONFIG.xinge_access_id = options.xinge_access_id;
                    CONFIG.xinge_access_key = options.xinge_access_key;

                    if (!device.isPhonegap()) {
                        return;
                    }

                    try {
                        _register();
                    } catch (e) {
                        logger.error('unhandled error in notification registration: ', e.message, e.stack);
                    }

                    document.addEventListener('wa_logout', function () {
                        try {
                            _unregister();
                        } catch (e) {
                            logger.error('unhandled error in notification unregistration: ', e.message, e.stack);
                        }
                    });

                    document.addEventListener('wa_auth_expired', function () {
                        try {
                            _unregister();
                        } catch (e) {
                            logger.error('unhandled error in notification unregistration: ', e.message, e.stack);
                        }
                    });
                },

                get_token: function () {
                    return window.push_token;
                }
            };

            return notification;
        }
    ]
);

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
