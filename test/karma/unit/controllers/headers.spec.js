'use strict';

(function() {
    describe('MEAN controllers', function() {
        describe('HeaderController', function() {
            // Load the controllers module
            beforeEach(module('mean'));

            var scope, HeaderController;

            beforeEach(inject(function($controller, $rootScope) {
                scope = $rootScope.$new();

                HeaderController = $controller('HeaderController', {
                    $scope: scope
                });
            }));

            it('should expose some global scope', function() {

                expect(scope.global).toBeTruthy();

            });
            it('should provide menu items', function() {
                expect(scope.menu).toBeTruthy();
            });
            it('should provide drop down links for menu items', function(){
                var tempArray = [];
                for (var i=0;i<scope.menu.length;i++){
                    for (var j=0;j<scope.menu[i].links.length;j++){
                        tempArray.push(scope.menu[i].links[j]);
                    }
                }
                expect(tempArray.length).toBeGreaterThan(scope.menu.length);

            })
        });
    });
})();