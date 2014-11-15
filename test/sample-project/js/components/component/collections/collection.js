define(['app', './../models/model'], function(app, Model){
    return app.Backbone.Collection.extend({
        model: Model
    });
});