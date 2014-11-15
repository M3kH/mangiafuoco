define(['app'], function(app){

    describe('MF should load a component', function() {
        var component;

        beforeEach(function(done) {
            app.load({type:'component', name: 'component', data: {}}).then(function(_r){
                component = new _r([]);
                done();
            });
        });

        it('is an instance of Backbone.component', function() {
            expect(component).toEqual(jasmine.any(app.Marionette.View));
        });

    });

});