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
