define(['app'], function(app){

    describe('MF should load a model', function() {
        var model;

        beforeEach(function(done) {
            app.load({type:'model', name: 'model', data: {}}).then(function(_r){
                model = new _r({});
                done();
            });
        });

        it('is an instance of Backbone.Model', function() {
            expect(model).toEqual(jasmine.any(app.Backbone.Model));
        });

    });

});