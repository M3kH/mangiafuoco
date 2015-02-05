//     MangiaFuoco.js 0.1.1a

//     (c) 2014-2015 Mauro Mandracchia, Full Stack Developer
//     MangiaFuoco may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://mangiafuocojs.org

(function (root, factory) {

    // Set up MangiaFuoco appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define([
            'require', 'underscore', 'jquery', 'exports'
        ], function (require, _, $, exports) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global Backbone.
            root.MF = factory(root, exports, _, $, 'amd', require);
        });

        // Next for Node.js or CommonJS. jQuery may not be needed as a module.
    }
    else if (typeof exports !== 'undefined') {
        var _ = require('underscore'),
            $ = require('jquery');

        factory(root, exports, _, $, 'commonjs', require);

        // Finally, as a browser global.
    }
    else {
        root.MF = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
    }

}(this, function (root, MF, _, $, loader, require ) {

    var __root = this,
        __arguments = arguments;

    loader = loader ? loader : false;

    // Underscore Deep Extend
    function deepExtend (obj) {
      var parentRE = /#{\s*?_\s*?}/,
          slice = Array.prototype.slice,
          hasOwnProperty = Object.prototype.hasOwnProperty;

      _.each(slice.call(arguments, 1), function(source) {
        for (var prop in source) {
          if (hasOwnProperty.call(source, prop)) {
            if (_.isUndefined(obj[prop]) || _.isFunction(obj[prop]) || _.isNull(source[prop]) || _.isDate(source[prop])) {
              obj[prop] = source[prop];
            }
            else if (_.isString(source[prop]) && parentRE.test(source[prop])) {
              if (_.isString(obj[prop])) {
                obj[prop] = source[prop].replace(parentRE, obj[prop]);
              }
            }
            else if (_.isArray(obj[prop]) || _.isArray(source[prop])){
              if (!_.isArray(obj[prop]) || !_.isArray(source[prop])){
                throw 'Error: Trying to combine an array with a non-array (' + prop + ')';
              } else {
                obj[prop] = _.reject(_.deepExtend(obj[prop], source[prop]), function (item) { return _.isNull(item);});
              }
            }
            else if (_.isObject(obj[prop]) || _.isObject(source[prop])){
              if (!_.isObject(obj[prop]) || !_.isObject(source[prop])){
                throw 'Error: Trying to combine an object with a non-object (' + prop + ')';
              } else {
                obj[prop] = _.deepExtend(obj[prop], source[prop]);
              }
            } else {
              obj[prop] = source[prop];
            }
          }
        }
      });
      return obj;
    };

    _.mixin({ 'deepExtend': deepExtend });


    // Save the previous value of the `MF` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var previousMF = root.MF,
        allowed_type = ['collection', 'model'],
        default_config = {
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
            mode: 'Backbone',
            html: false
        },
        default_option = {
            id: false,
            type: false,
            name: false,
            extend: false,
            data: false,
            init: false
        },
        default_adapter = {
            type: false,
            dir: false,
            index: false,
            onGetPath: false,
            onExtend: false,
            onReturnInstace: false
        },
        default_globals = ['$', '_'];

    // Initial Setup
    // -------------
    MF = function( config, options ){

        var self = this;

        this.instances = {};
        this.config = {};

        if( config.globals){
            this.config.globals = config.globals
        }else{
            this.config.globals = default_globals;
        }

        if ( config ) this.config = _.deepExtend(this.config, default_config, config);
        Global(this.config.globals);

        if(this.config.mode) loadMode(this.config.mode);


        if ( _.isArray(options) ){
            _.each(options, function(option){
                option = _.extend(default_option, option);
                self.init(option);
            });
        }

        if(options){
            options = _.extend(default_option, options);
            this.init( options );
        }

        return this;
    };

    MF.prototype.VERSION = '0.2.5';
    MF.prototype.adapters = {};

    MF.prototype.noConflict = function () {
        root.MF = previousMF;
        return this;
    };

    // Utilities for the MangiaFuoco Extensions, Globals and Adapters
    var canHaveProperty = function( property, nested ){
            if(nested && MF.prototype[nested]) return !(_.has(property, MF.prototype[nested]));
            return !(_.has(property, MF.prototype));
        },

        // @option <Object> { GlobalVariable: Value }
        // @nested <String>
        addGlobal = function( option, nested ){

            return _.each(option, function(value, key){
                if(!canHaveProperty(key, nested)) return false;

                if( nested === 'adapters' ){
                    allowed_type.push(key);
                }

                if(nested){
                    if(!MF.prototype[nested]) MF.prototype[nested] = {};
                    MF.prototype[nested][key] = value;
                }else{
                   MF.prototype[key] = value;
                }

                return value;
            });
        },

        addGlobalFromString = function( global, nested ){

            var value,
                config = {};

            if(root[global]) value = root[global];
            if(!value && __root[global]) value = root[global];
            if(!value && __arguments[global]) value = __arguments[global];
            if(!value) value = require(global);

            if(!value) return false;

            config[global] = value;
            return addGlobal(config, nested);

        },

        // Global
        // Add global variables to MF object
        Global = MF.prototype.global = function( options ){
            if( !options ) return false;

            if(_.isArray(options)){
                return _.each(options, function(option){
                    if(_.isString(option)) return addGlobalFromString( option );
                    return addGlobal( option );
                })
            }

            if(_.isString(options)) return addGlobalFromString(options);

            return addGlobal( options );
        },

        // Adapters
        // Add additional type of file to load
        default_adapter = {

            type: false,

            dir: function( opt ){ return opt.type+'s/'; },

            index: false,

            // Return string of the finale path default: mainPath+opt.type+'/'+opt.name
            onGetPath: function ( opt, path, extendPath ) {
                return {path: path, extend: extendPath};
            },

            // Return an object to be extended object default: opt.extend.
            onExtend: function (opt, obj) {
                if(opt.el) opt.extend.el  = opt.el;
                return obj.extend(opt.extend);
            },

            // Returns an obj {id: opt.id, obj: new obj(opt.data)} or just new obj(opt.data);
            onReturnInstance: function (opt, obj, _req) {
                var instance;

                switch (_req) {

                    case 'get':
                        return obj;

                    case 'set-fetch':
                        instance = new obj();
                        instance.fetch();

                    default:
                        instance = new obj(opt.data);
                }

                return instance;

                return new obj(opt.data);
            }
        },

        addAdapters = MF.prototype.adapter = function( adapters ){
            if( !adapters ) return false;

            if(_.isArray(adapters)){
                return _.each(adapters, function(adapter){
                    return addGlobal(adapter, 'adapters');
                });
            }

            if(_.isString(adapters)) return addGlobalFromString(adapters);

            return addGlobal(adapters, 'adapters');
        },

        Modes = {
            'Backbone': {
                'view': {

                    defaults: {
                        el: false,
                        init: true
                    },

                    onExtend: function (opt, obj) {
                        if(opt.el) opt.extend.el  = opt.el;
                        return obj.extend(opt.extend);
                    },

                    onReturnInstance: function (opt, obj, _req) {
                        var instance;

                        if(obj.then){
                            return obj.then(function(_obj){
                                instance = new _obj({el: opt.el, data: opt.data});
                                console.log(instance.template);
                                if(instance.template) instance.render();
                                return instance;
                            });
                        }

                        instance = new obj({el: opt.el, data: opt.data});

                        if(instance.template) instance.render();
                        if( _.isFunction(instance.render) && instance.template) instance.render();
                        return instance;
                    }
                },

                'component' : {

                    onGetPath: function ( opt, path, extendPath ) {
                        path = path + '/index';
                        if (extendPath) {
                            extendPath = extendPath + '/index';
                        }

                        return {path: path, extend: extendPath};
                    },

                    onExtend: function (opt, obj) {
                        if(opt.el) opt.extend.el  = opt.el;
                        return obj.extend(opt.extend);
                    },

                    onReturnInstance: function (opt, obj, _req) {
                        var instance = new obj({el: opt.el, data: opt.data});
                        if( _.isFunction(instance.render) ) instance.render();
                        return instance;
                    }
                }

            }
        },
        setMode = MF.prototype.addMode = function(modeName, mode){
            var _mode = {};
            _mode[modeName] = mode;

            Modes = _.extend(Modes, _mode);
        },
        loadMode = MF.prototype.mode = function( mode ){
            if( !mode || !Modes[mode]) return false;
            _.each(Modes[mode], function(_wrapFunctions, type){
                var __adapter = {};
                __adapter[type] = _wrapFunctions;
                addAdapters(__adapter);
            })
        };

    _.extend( MF.prototype, {

        notify: function (msg) {
            console.log(msg);
            return false;
        },

        init: function (options, done) {
            var self = this;

            if (this.config.html) this._parseHtml();

            if ( _.isArray(options) ) {
                return _.each(options, function(option){ return self._parse(option); });
            }

            if(!options) return false;

            return this._parse(options, done);
        },

        load: function (options, done) {

            if(!options) return false;

            var self = this;

            if  ( _.isArray(options) ) {
                return _.each(options, function (option, index) {
                    option.init = 'raw';
                    return self._parse(option);
                });
            }

            options.init = 'raw';
            return self._parse(options, done);
        },

        _parse: function (option, done) {
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

            setTimeout(function(){
                self._load(option, function (_result) {
                    if (done) {
                        done(_result);
                    }
                    return def.resolve(_result);
                });
            }, 3);

            // Ensure a normalized return value (Promise)
            return def.promise();
        },

        _parseHtml: function () {
            var self = this,
                selectors = '';

            _.each(allowed_type, function(type){
                selectors += '[data-'+type+'], ';
            });

            return $(selectors+' .js-mf').each(function (i, $elem) {
                var opt = $($elem).data();
                opt.el = $elem;
                self._parse(opt);
            });
        },

        _setType: function( opt ){
            _.forEach(allowed_type, function(type){
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
                req,
                defaults = {};

            // Set type and validate request
            if(!opt.type) { opt = self._setType(opt); };
            if (!self._validateRequest(opt)) return false;

            // Extend with Adapter
            if(MF.prototype.adapters[opt.type] && MF.prototype.adapters[opt.type]['defaults'] ){
                defaults = MF.prototype.adapters[ opt.type ]['defaults'];
            }
            defaults = _.extend({}, default_option, defaults);
            opt = _.extend( defaults, opt );

            req = self._getTypeRequest(opt);

            if (!opt.id) {
                opt.id = _.uniqueId("mf-");
            }

            return self._getInstance(opt, req, done);

        },

        _getInstance: function (option, req, done) {

            var instaces = this.instances,
                instace = (this._isInstance(option.type, option.id)) ? instaces[option.type][option.id] : false;

            if (instace) {
                return instace.instance;
            }

            if (req.type === 'get' && req.init) {
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
            if(!opt.name) return false;
            this._loadFile(opt, _req, done);

        },

        _getPath: function(opt){
            var self = this,
                type = opt.type,
                name = opt.name,
                dest = this.config.paths[type] + name,
                path = (type != 'component') ? this.config.paths.main + dest : dest,
                extendPath = this.config.paths.extend ? this.config.paths.extend + path : false;

            if(this.adapters[opt.type] && _.isFunction(this.adapters[opt.type]['onGetPath'])){
                return this.adapters[opt.type]['onGetPath'].call(this, opt, path, extendPath);
            }

            return default_adapter.onGetPath.call(this, opt, path, extendPath);
        },

        _loadFile: function (opt, _req, done) {

            var self = this,
                paths = self._getPath(opt),
                path = paths.path,
                extendPath = paths.extend,
                callback = function (obj) {
                    if(_.isFunction(obj)){
                        var _instance = self._setupObject(opt, obj, _req);
                        if (done) done(_instance);
                        return _instance;
                    }else if(_.isObject(obj) && obj.then){
                        return obj.then(function(_obj){
                            _obj = self._setupObject(opt, obj, _req);
                            if (done) done(_obj);
                        });
                    }
                };

            if (!loader) {
                this.notify({
                    type: 'error',
                    msg: 'Not loader defined for embed modules, Mangiafuoco needs RequireJS or CommonJS'
                });
                return false;
            }

            return this._loadFromFile(path, extendPath, callback);
        },

        // Set the instance under the application wrap
        _setInstance: function( opt, obj ){
            if (!this._isInstance(opt.type, opt.id)) {
                if(!(opt.type in this.instances)) this.instances[opt.type] = {};
                this.instances[opt.type][opt.id] = {opt: opt, instance: obj};
                return true;
            }

            this.notify({
                type: 'error',
                msg: 'This instance already exist, sorry you can\'t create two instances with the same id: ' + opt.id,
                ref: this.instances[opt.type]
            });
            return false;
        },

        // This method should be simplify
        // Should just set the instance but provide some
        _setupObject: function (opt, obj, _req) {
            var instance;
                obj = this._extendObject(opt, obj);

            if(opt.init === 'raw') return obj;
            instance = this._getInstanceObject(opt, obj, _req);

            this._setInstance(opt, instance);
            return instance;
        },

        _extendObject: function(opt, obj){

            if ( !_.isObject(opt.extend) || !_.isFunction(obj.extend)) return obj;

            if( this.adapters[opt.type] && _.isFunction(this.adapters[opt.type]['onExtend'])){
                return this.adapters[opt.type]['onExtend'].call(this, opt, obj);
            }

            return default_adapter.onExtend.call(this, opt, obj);

        },

        _getInstanceObject: function(opt, obj, _req){

            if( this.adapters[opt.type] && _.isFunction(this.adapters[opt.type]['onReturnInstance'])){
                return this.adapters[opt.type]['onReturnInstance'].call(this, opt, obj, _req);
            }

            return default_adapter.onReturnInstance.call(this, opt, obj, _req);
        },

        // Load the file and return the obj
        _loadFromFile: function (path, extended, cb) {
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
            if (opt.type && _.has(allowed_type, opt.type)) {
                var allowedRequest = allowed_type.concat(", ");
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
            if (opt.init === 'raw') {
                return {type: 'get', init: false};
            }
            if ((!opt.init && !opt.data) && _.isString(opt.id) && _.isString(opt.name)) {
                return {type: 'get', by: 'id'};
            }

            this.notify({type: 'error', msg: 'Not a valid Request is defined check the rules', ref: opt});

            return false;
        }
    });

    return MF;

}));