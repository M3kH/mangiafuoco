define(['app', 'tpl!./../templates/template'], function(app, template){
    return app.Marionette.ItemView.extend({
        template: template,
        initialize: function(){
            //console.log(this.render);
            this.model = new app.Backbone.Model({});
        }
    });
});