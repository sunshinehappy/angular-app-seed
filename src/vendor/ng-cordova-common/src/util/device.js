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
