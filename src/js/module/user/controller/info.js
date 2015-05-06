module.exports = [
    '$scope',
    'service.user',
    function($scope, userSvr) {
        console.log('user info controller');
        $scope.bla = function() {
            console.log('bla is clicked');
            userSvr.test();
        };
    }
];