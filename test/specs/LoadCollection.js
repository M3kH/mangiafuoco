define(['app'], function(app){

    describe('MF should load a collection', function() {
        var collection;

        beforeEach(function(done) {
            app.load({type:'collection', name: 'collection', data: {}}).then(function(_r){
                collection = new _r([]);
                done();
            });
        });

        it('is an instance of Backbone.Collection', function() {
            expect(collection).toEqual(jasmine.any(app.Backbone.Collection));
        });

    });

});