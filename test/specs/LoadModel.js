define(['app'], function(app){

    describe('MF should load a model', function() {
        var model;

        beforeEach(function(done) {
            app.load({model: 'model', data: { something: 'something'}}).then(function(_r){
                model = new _r({});
                done();
            });
        });

        it('is an instance of Backbone.Model', function() {
            expect(model).toEqual(jasmine.any(app.Backbone.Model));
        });

    });

    describe('MF should load a model was putted in a session', function() {
        var model;

        beforeEach(function(done) {
            app.init({model: 'model', id: 'special_model', data: { something: 'something'}}).then();
            app.load({type:'model', id: 'special_model'}).done(function(_r){
                model = _r;
                done();
            });
        });

        it('is an instance of Backbone.Model', function() {
            expect(model).toEqual(jasmine.any(app.Backbone.Model));
        });

    });

});