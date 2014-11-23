define(['app'], function(app){

    describe('MF should load a simple view', function() {
        var view;

        beforeEach(function(done) {
            setFixtures('<div id="main-view"/>');
            app.init({type:'view', name: 'view', el:"#main-view"}).then(function(_r){
                view = _r;
                done();
            });
        });

        it('is an instance of Marionette.View', function() {
            expect(view).toEqual(jasmine.any(app.Marionette.View));
        });

        it('expect the view to have element #main-view id', function() {
            expect(view.$el).toHaveId("main-view");
        });

        it('expect the element #main-view to have loaded the correct template, checking \'Hello World!\' ', function() {
            expect(view.$el).toContainText("Hello World!");
        });

    });

    describe('MF should load and extend a view', function(){
        var view;

        beforeEach(function(done) {
            setFixtures('<div id="main-view"/>');
            app.init({type:'view', name: 'view',
                extend: { _text: 'something', _function : function(){}, _obj: {}  },
                el:"#main-view"}).then(function(_r){
                view = _r;
                done();
            });
        });

        it('expect view has _text', function() {
            expect(view._text).toEqual(jasmine.any(String));
        });

        it('expect view has _function', function() {
            expect(view._function).toEqual(jasmine.any(Function));
        });

        it('expect view has _obj', function() {
            expect(view._obj).toEqual(jasmine.any(Object));
        });
    });

});