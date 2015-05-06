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