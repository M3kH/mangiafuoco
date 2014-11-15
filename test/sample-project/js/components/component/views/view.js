define(['app', './../collections/collection', 'tpl!./../templates/template'], function(app, Collection, template){
    return app.Marionette.View.extend({
        'template': template,
        initialize: function( options ){
            options = options ? options : [];
            this.collection = new Collection(options);
        }
    });
});