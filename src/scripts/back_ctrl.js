/*global require, angular, console, module, confirm */

module.exports = function () {
    'use strict';

    angular
        .module('keyApp')
        .filter('getById',
            function() {
                return function(input, id) {
                    var i=0, len=input.length;
                    for (; i<len; i++) {
                        if (+input[i].id == +id) {
                            return input[i];
                        }
                    }
                    return null;
                }
            });
    
    angular
        .module('keyApp')
        .run(['$rootScope', '$location', 'AuthService',
            function ($rootScope, $location, AuthService) {
                $rootScope.logout = function () {
                    console.log('logout');
                    AuthService.logout();
                    $location.path('/login');
                };
                $rootScope.$on('$routeChangeStart',
                    function (event) {
                        $rootScope.sv = AuthService.authorized();
                        if (!$rootScope.sv && $location.$$path !== '/login') {
                            // console.log('DENY');
                            $location.path('/login');
                        }
                    });
            }]);

    angular
        .module('keyApp')
        .controller('MainCtrl', ['$scope', 'ApiRestService', '$location', 'AuthService', '$timeout',
            function ($scope, ApiRestService, $location, AuthService, $timeout) {
               
                $scope.submit = function () {
                    AuthService.login($scope.username, $scope.password).then(function() {
                        console.log('login succes');
                        $timeout(function () {
                            $location.path('/projects');
                        }, 600);

                    });
                }
            }]);

    angular
        .module('keyApp')
        .controller('ListCtrl', ['$scope', 'ApiRestService', '$route', 'Projects',
            function ($scope, ApiRestService, $route, Projects) {
                var route = $route.current.$$route.name,
                    entry = new ApiRestService();
                $scope.showdata = {route: route};
                
                Projects.get().then(function (data) {
                    $scope.showdata.projects = data;
                });
                
                ApiRestService.query({
                    chap: route
                }, function (result) {
                    $scope.data = result;
                });
                $scope.delete = function (id, idx) {
                    if (confirm('Are you sure  to delete?')) {
                        entry.$delete({id: id, chap: route}, function (res) {
                            $scope.data.splice(idx, 1);
                        });
                    }
                };
                $scope.block = function (id, idx) {
                    // if (confirm('Are you sure to block?')) {
                        $scope.data[idx].$update({id: id, chap: route}, function (res) {
                            // $scope.data.splice(idx, 1);
                        });
                    // }
                };

            }]);

    angular
        .module('keyApp')
        .controller('ProjectNewCtrl', ['$scope', 'ApiRestService', '$location',
            function ($scope, ApiRestService, $location) {
                $scope.title = 'Create';
                $scope.project = new ApiRestService({
                    id: 0,
                    name: 'Proj1',
                    status: true
                });

                $scope.save = function () {
                    $scope.project.status = +$scope.project.status;
                    $scope.project.$save({
                        chap: 'projects'
                    }, function (res) {
                        $location.path('/projects');
                    });
                };
            }]);

    angular
        .module('keyApp')
        .controller('ProjEditCtrl', ['$scope', 'ApiRestService', '$routeParams', '$location',
            function ($scope, ApiRestService, $routeParams, $location) {
                $scope.title = 'Edit';
                $scope.save = function () {
                    $scope.project.$update({
                        chap: 'projects',
                        id: $routeParams.id,
                        status: +$scope.project.status
                    }, function (res) {
                        $location.path('/projects');
                    });
                };

                ApiRestService.get({
                    id: $routeParams.id,
                    chap: 'projects'
                }, function (result) {
                    $scope.project = result;
                    $scope.project.status = (+result.status) ? true : false;
                });

            }]);
    
    angular
        .module('keyApp')
        .controller('CodeAddCtrl', ['$scope', 'ApiRestService', '$location', '$route', 'Projects',
            function ($scope, ApiRestService, $location, $route, Projects) {
                var route = $route.current.$$route.name;
                
                $scope.model = {
                    title : ('Add ' + route),
                    dataTitle : route
                };

                Projects.get().then(function (data) {
                    $scope.model.projects = data;
                    $scope.model.cproj = $scope.model.projects[0].id;
                });

                $scope.save = function () {
                    var arrStr = $scope.model.data.split("\n");

                    $scope.project = new ApiRestService({
                        data: arrStr,
                        proj: $scope.model.cproj
                    });
                    
                    $scope.project.$save({
                        chap: route,
                        id: 'add'
                    }, function (res) {
                        $location.path('/' + route);
                    });
                };
            }]);

};
