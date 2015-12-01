/*global require, angular, console, module, confirm */
module.exports = function () {
    'use strict';
    angular.module('keyApp')
        .directive('ngSimplFilter', function () {
            var linkFunction = function (scope, element, attributes) {
                scope.field = attributes.ngSimplFilter;
            };
            return {
                restrict: 'A',
                templateUrl: 'parts/search.html',
                link: linkFunction
            };
        });

    angular.module('keyApp')
        .directive('ngListOps', function () {
            return {
                restrict: 'A',
                templateUrl: 'parts/ops.html'
            };
        });
};
