module.exports = [
    'common.component.storage',
    'common.util.http',
    function(storage, http) {
        var service = {
            test: function() {
                storage.set('x', [5, 6, 7, 8, 9]).then(function() {
                    console.log('storage ok');
                }, function() {
                    console.log('storage error');
                });
            },
            register: function() {

            },
            getProfile: function() {

            }
        };
        return service;
    }
];