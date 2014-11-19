//     MangiaFuoco.js 0.1.1a

//     (c) 2014-2015 Mauro Mandracchia, Full Stack Developer
//     MangiaFuoco may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://mangiafuocojs.org

(function (root, factory) {

    // Set up MangiaFuoco appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define([
            'require', 'underscore', 'jquery', 'backbone', 'marionette', 'exports'
        ], function (require, _, $, Backbone, Marionette, exports) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global Backbone.
            root.MF = factory(root, exports, _, Backbone, Marionette, require, $, 'amd');
        });

        // Next for Node.js or CommonJS. jQuery may not be needed as a module.
    }
    else if (typeof exports !== 'undefined') {
        var _ = require('underscore'),
            Backbone = require('backbone'),
            Marionette = require('marionette'),
            $ = require('jquery');

        factory(root, exports, _, Backbone, Marionette, require, $, 'commonjs');

        // Finally, as a browser global.
    }
    else {
        root.MF = factory(root, {}, root._, root.Backbone, root.Marionette, (root.jQuery || root.Zepto || root.ender || root.$));
    }

}(this, function (root, MF, _, Backbone, Marionette, require, $, loader) {

    loader = loader ? loader : false;

    // Save the previous value of the `MF` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var previousMF = root.MF;

    // Initial Setup
    // -------------
    MF = Marionette.Application.extend({

        instances: {
            model: {},
            collection: {},
            view: {},
            component: {}
        },

        config: {
            paths: {
                extend: false,
                main: 'libs/',
                collection: 'collections/',
                component: 'components/',
                model: 'models/',
                templates: 'templates/',
                view: 'views/',
                i18n: 'i18n/',
                lang: 'en-en',
                dtmz: 'GTM+1'
            },
            html: false
        },

        notify: function (msg) {
            console.log(msg);
            return false;
        },

        initialize: function (config) {
            if (config) {
                this.config = jQuery.extend(true, this.config, config);
            }
        },

        init: function (option, done) {
            this._parse(option, done);

            if (this.config.html) {
                this._parseHtml();
            }
        },

        load: function (options, done) {
            if (!_.isArray(options) && _.isObject(options)) {
                options.init = 'extend';
                return this._parse(options, done);
            }else{
                return _.each(options, function (option, index) {
                    option.init = 'extend';
                    return this._parse(option);
                });
            }
        },

        _parse: function (options, done) {
            var self = this;
                result = [],
                def = new $.Deferred(),
                _done = function (index) {
                    return function (_result) {
                        result.push(_result);
                        if (options.length === index) {
                            if (done) {
                                done(result);
                            }
                            return def.resolve(result);
                        }
                    }
                };

            if (!_.isArray(options) && _.isObject(options)) {
                setTimeout(function(){
                    self._load(options, function (_result) {
                        if (done) {
                            done(_result);
                        }
                        return def.resolve(_result);
                    });
                }, 3);
            }else{
                _.each(options, function (option, index) {
                    setTimeout(function(){
                        self._load(option, _done(index));
                    }, 3);
                });
            }

            // Ensure a normalized return value (Promise)
            return def.promise();
        },

        _allowedType: ['collection', 'model', 'view', 'component'],

        _parseHtml: function () {
            var self = this;
            return $('.js-mf').each(function (i, $elem) {
                var opt = $($elem).data();
                opt.el = $elem;
                self._parse(opt);
            });
        },

        _setType: function( opt ){
            _.forEach(this._allowedType, function(type){
                var name = opt[type];
               if( _.isString(name) ){
                   opt.type = type;
                   opt.name = name;
               }
            });
            return opt;
        },

        _load: function (opt, done) {

            var self = this,
                req;

            opt = _.extend({
                id: false,
                el: false,
                name: false,
                type: false,
                data: false,
                global: false,
                extend: false,
                init: false,

                //Data reserved this are substitude of type and name
                collection: false,
                component: false,
                model: false,
                view: false

                // Not current supported but looking forward
                // I would like to have withChildView, withTemplate and:
                // withModel: false,
                // withCollection: false,
            }, opt);

            if(!opt.type) { opt = self._setType(opt); };

            if (!self._validateRequest(opt)) {
                return false;
            }
            req = self._getTypeRequest(opt);

            if (!opt.id) {
                opt.id = _.uniqueId("mf-");
            }

            self._getInstance(opt, req, done);

        },

        _getInstance: function (option, req, done) {

            var instaces = this.instances,
                instace = (this._isInstance(option.type, option.id)) ? instaces[option.type][option.id] : false;

            if (req.type === 'get' && req.init) {
                if (instace) {
                    return instace.instance;
                }
                this.notify({
                    type: 'error',
                    msg: 'The ' + option.type + ' with id ' + option.id + ' instance doesn\'t exists.',
                    ref: {option: option, instances: instances}
                });
                return false;
            }

            this._loadObject(option, req, done);
        },

        _isInstance: function (type, id) {
            return (_.isObject(this.instances[type]) && _.isObject(this.instances[type][id]));
        },

        _loadObject: function (opt, req, done) {

            // Parse request first:
            var _req = opt.by ? req.type + "-" + req.by : req.type;

            // If is get-id, should just return the collection
            // If is get and init is false return the collection/model to be extended so basically works even for internally, similar to set-fetch or set-data; without init;
            this._loadFile(opt, _req, done);

        },

        _loadFile: function (opt, _req, done) {
            var self = this,
                type = opt.type,
                name = opt.name,
                dest = this.config.paths[type] + name,
                path = (type != 'component') ? this.config.paths.main + dest : dest,
                extendPath = this.config.paths.extend ? this.config.paths.extend + path : false,
                callback = function (obj) {
                    if(_.isFunction(obj)){
                        var _obj = self._setInstance(opt, obj, _req);
                        if (done) done(_obj);
                        return _obj;
                    }else if(_.isObject(obj) && obj.then){
                        return obj.then(function(_obj){
                            _obj = self._setInstance(opt, obj, _req);
                            if (done) done(_obj);
                        });
                    }
                };


            if (type === 'component') {
                path = path + '/index';
                if (extendPath) {
                    extendPath = extendPath + '/index';
                }
            }

            if (!loader) {
                this.notify({
                    type: 'error',
                    msg: 'Not loader defined for embed modules, Mangiafuoco needs RequireJS or CommonJS'
                });
                return false;
            }

            return this._loadAmd(path, extendPath, callback);
        },

        _setInstance: function (opt, obj, _req) {
            var instance;

            if (!this._isInstance(opt.type, opt.id)) {
                this.instances[opt.type][opt.id] = {opt: opt};
            } else {
                this.notify({
                    type: 'error',
                    msg: 'This instance already exist, sorry you can\'t create two instances with the same id: ' + opt.id,
                    ref: this.instances[opt.type]
                });
                return false;
            }

            if (_.isObject(opt.extend) && _.isFunction(obj.extend)) {
                obj = obj.extend(opt.extend);
            }

            switch (_req) {

                case 'view':
                    if(_.isFunction(obj)){
                        this.instances[opt.type][opt.id].instance = instance = new obj({el: opt.el, data: opt.data});
                        instance.render();
                    }
                    if(obj.then){
                        this.instances[opt.type][opt.id].instance = instance = obj.then(function(_obj){
                            var _instance = new _obj({el: opt.el, data: opt.data});
                            _instance.render();
                            return _instance;
                        });
                    }

                    return instance;

                case 'get':
                    return obj;

                case 'set-fetch':
                    _obj = new obj();
                    _obj.fetch();
                    this.instances[opt.type][opt.id].instance = _obj;

                    return _obj;

                default:
                    this.instances[opt.type][opt.id].instance = new obj(opt.data);
                    return this.instances[opt.type][opt.id].instance;
            }
        },

        _loadAmd: function (path, extended, cb) {
            var self = this;
            require([path], function (obj) {

                cb(obj);

            }, function (err) {

                if (!extended) {
                    self.notify({type: 'error', msg: 'File: ' + path + ' not found!', ref: err});
                    return false;
                }

                require([extended], function (_obj) {
                    cb(_obj);
                }, function (err) {
                    self.notify({type: 'error', msg: 'File: ' + path + ' not found!', ref: err});
                });
            });
        },

        _validateRequest: function (opt) {

            // Type is required
            if (opt.type && _.has(this._allowedType, opt.type)) {
                var allowedRequest = this._allowedType.concat(", ");
                self.notify({
                    type: "error",
                    message: "Option type is required and should be one of the allowed request: " + allowedRequest,
                    ref: opt
                });
                return false;
            }

            return true;
        },

        _getTypeRequest: function (opt) {
            var request = this._defineTypeRequest(opt);
            return request ? _.extend({
                type: false,
                by: false,
                url: false,
                init: true
            }, request) : false;
        },

        _defineTypeRequest: function (opt) {
            var isView = (opt.type === 'view' || opt.type === 'component');

            if (isView && opt.el) {
                return {type: 'view', by: 'init'};
            }

            if (isView && !opt.el && !opt.init) {
                this.notify({
                    type: 'error',
                    msg: 'You are trying to execute a ' + opt.type + ' without an el',
                    ref: opt
                });
                return false;
            }

            // When data is set, is a set request
            if (opt.data && !opt.init) {
                return {type: 'set', by: 'data'};
            }

            // When init is set to fetch is a set request
            if (opt.init === 'fetch' || opt.init === true) {
                return {type: 'set', by: 'fetch'};
            }

            // When init is a string with match with fetch! would take the url by the string
            if (_.isString(opt.init) && opt.init.indexOf('fetch!') > -1) {
                return {type: 'set', by: 'fetch', url: opt.init.split('fetch!')[0]};
            }

            // If is init and data omitted and opt.id and opt.name is a string is a get
            if (opt.init === 'extend') {
                return {type: 'get', init: false};
            }
            if ((!opt.init && !opt.data) && _.isString(opt.id) && _.isString(opt.name)) {
                return {type: 'get', by: 'id'};
            }

            this.notify({type: 'error', msg: 'Not a valid Ruest is defined check the rules', ref: opt});

            return false;
        },
        $: $,
        _: _,
        Backbone: Backbone,
        Marionette: Marionette,
        noConflict: function () {
            root.MF = previousMF;
            return this;
        },
        VERSION: '0.2.3'
    });
    return MF;

}));