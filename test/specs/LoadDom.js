define(['app'], function(app){

    describe('MF should load from DOM', function() {

        beforeEach(function(done) {
            setFixtures('<div id="main-view" data-view="view" class="js-mf"/>');
            app.init();

            // Apparently I've to delay the done of 50, todo: need investigation.
            setTimeout(function(){
                done();
            },50);
        });

        it('expect the element #main-view to have loaded the correct template, checking \'Hello World!\' ', function() {
            expect($('#main-view')).toContainText("Hello World!");
        });

    });
});