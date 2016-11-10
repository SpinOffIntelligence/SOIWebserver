'use strict';

(function() {
    describe('MEAN controllers', function() {
        describe('FRMController', function() {
            // Load the controllers module
            beforeEach(module('mean'));

            var scope, FRMController;

            beforeEach(inject(function($controller, $rootScope) {
                scope = $rootScope.$new();

                FRMController = $controller('FRMController', {
                    $scope: scope
                });
            }));

            it('should expose some global scope', function() {

                expect(scope.global).toBeTruthy();

            });
            it('should have links ready for frm page', function() {

                expect(scope.links).toBeTruthy();
                expect(scope.links.length).toBe(5);

            });
        });
    });
})();