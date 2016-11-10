'use strict';

(function() {
    describe('MEAN controllers', function() {
        describe('RegisterController', function() {
            // Load the controllers module
            beforeEach(module('mean'));

            var scope, RegisterController, _$window_, _$state_, _Countries, _Companies, _Locations, _Roles, _Organizations, _HearBoutUs;

            beforeEach(inject(function($controller, $rootScope) {
                scope = $rootScope.$new();

                RegisterController = $controller('RegisterController', {
                    $scope: scope,
                    $window: _$window_,
                    $state: _$state_,
                    $localStorage: {user: {name: 'Khalid'}},
                    Countries: _Countries,
                    Companies: _Companies,
                    Locations: _Locations,
                    Roles: _Roles,
                    Organizations: _Organizations,
                    HearBoutUs: _HearBoutUs 
                });
            }));

            it('should expose some global scope', function() {
                expect(scope.global).toBeTruthy();
            });

            it('should have three steps', function() {
                expect(scope.steps.length).toBe(3);
            });

            it('should have step 0 as default current step', function(){
                expect(scope.step).toBe(0);
            });

            it('should report the current step correctly', function(){
                scope.step = 2;
                expect(scope.isCurrentStep(2)).toBeTruthy();
            });
            it('should set the current step correctly', function(){
                scope.step = 0;
                scope.setCurrentStep(1);
                expect(scope.step).toBe(1);
            });
            it('should retrieve the current step correctly', function(){
                scope.step = 0;
                expect(scope.getCurrentStep()).toBe('one');
            });
            it('should display the correct label for each step', function(){
                scope.step = 0;
                expect(scope.getNextLabel()).toBe('Next');
                scope.step = 1;
                expect(scope.getNextLabel()).toBe('Next');
                scope.step = 2;
                expect(scope.getNextLabel()).toBe('Submit');
            });
            it('should handle previous step correctly', function(){
                scope.step=0;
                scope.handlePrevious();
                expect(scope.step).toBe(0);
                scope.step=1;
                scope.handlePrevious();
                expect(scope.step).toBe(0);
                scope.step=2;
                scope.handlePrevious();
                expect(scope.step).toBe(1);
            });
            it('should handle next step correctly', function(){
                scope.step=0;
                scope.handleNext();
                expect(scope.step).toBe(1);
                scope.step=1;
                scope.handleNext();
                expect(scope.step).toBe(2);
                scope.step=2;
                scope.handleNext();
                expect(scope.step).toBe(2);
            });
            it('should set user as $localStorage user', function(){
                expect(scope.user.name).toBe('Khalid');
            });
        });
    });
})();