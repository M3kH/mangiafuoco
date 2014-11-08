//     MangiaFuoco.js 0.1.1a

//     (c) 2014-2015 Mauro Mandracchia, Full Stack Developer
//     MangiaFuoco may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://mangiafuocojs.org

(function (root, factory) {

    // Set up MangiaFuoco appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['require', 'underscore', 'jquery', 'backbone', 'marionette', 'exports'], function (_, $, Backbone, Marionette, exports) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global Backbone.
            root.MF = factory(root, exports, _, Backbone, Marionette, $, 'amd');
        });

        // Next for Node.js or CommonJS. jQuery may not be needed as a module.
    } else if (typeof exports !== 'undefined') {
        var _ = require('underscore'),
            Backbone = require('backbone'),
            Marionette = require('marionette'),
            $ = require('jquery');

        factory(root, exports, _, Backbone, Marionette, require, $, 'commonjs');

        // Finally, as a browser global.
    } else {
        root.MF = factory(root, {}, root._, root.Backbone, root.Marionette, (root.jQuery || root.Zepto || root.ender || root.$));
    }

}(this, function (root, MF, _, Backbone, Marionette, require, $, loader) {

    loader = loader ? loader : false;

    // Initial Setup
    // -------------
    MF = Marionette.Application.extend({

        instances: {
            models: {},
            collections: {},
            views: {},
            components: {}
        },

        notify: function (msg) {
            console.log(msg);
            return false;
        },

        init: function (optionCollection, config) {

            var self = this,
                config = _.extend({
                    paths: {
                        extend:         false,
                        main:           'libs/',
                        collection:     'libs/collection/',
                        templates:      'libs/templates/',
                        views:          'libs/views/',
                        components:     'components/',
                        i18n:           'i18n/',
                        lang:           'en-en',
                        dtmz:           'gt+1'
                    },
                    html: false
                }, config);

            self.config = config;

            if (!_.isArray(optionCollection) && _.isObject(optionCollection)) return self.load(optionCollection);
            if (config.html) this._parseHtml();

            var _instances = _.each(optionCollection, function (option) {
                return self.load(opt);
            });
        },

        _allowedType: ['collection', 'model', 'view', 'components'],

        _parseHtml: function () {
            return MF.$('.js-mf').each(function (i, $elem) {
                var opt = $elem.data();
                this.load(opt);
            });
        },

        load: function (opt) {

            var self = this,
                req;

            opt = _.extend({
                id: false,
                el: false,
                withModel: false,
                withCollection: false,
                name: false,
                type: false,
                data: false,
                global: false,
                extend: false,
                init: false
            }, opt);

            if (!self._validateRequest(opt)) return false;
            req = self._getTypeRequest(opt);

            if (!opt.uniqueId) opt.uniqueId = _.uniqueId("mf-");

            return self._getInstance(opt, req);

        },

        _getInstance: function (option, req) {

            var instaces = this.instances,
                instace = _.isObject(instaces[option.type][option.id]) ? instaces[option.type][option.id] : false;

            if (req.type === 'get' && req.init) {
                if (instace) return instace.instance;
                this.notify({
                    type: 'error',
                    msg: 'The ' + option.type + ' with id ' + option.id + ' instance doesn\'t exists.',
                    ref: {option: option, instances: instances}
                });
                return false;
            }

            return this._loadObject(option, req);
        },

        _loadObject: function (opt, req) {

            // Parse request first:
            var _req = opt.by ? req.type + "-" + req.by : req.type,
                obj, _obj;

            if (!this.instances[opt.type][opt.id]) {
                this.instances[opt.type][opt.id] = {opt: opt};
            } else {
                this.notify({
                    type: 'error',
                    msg: 'This instance already exist, sorry you can\'t create two instances with the same id: ' + opt.id
                });
                return false;
            }

            // If is get-id, should just return the collection
            // If is get and init is false return the collection/model to be extended so basically works even for internally, similar to set-fetch or set-data; without init;
            obj = this.loadFile(opt.type, opt.name);
            if (!obj) return false;

            if (_.isObject(opt.extend) && _.isFunction(obj.extend)) obj = obj.extend(opt.extend);

            switch (_req) {
                case 'get':
                    return obj;

                case 'set-fetch':
                    _obj = new obj();
                    _obj.fetch();
                    this.instances[opt.type][opt.id].instance = _obj;

                    return _obj;

                case 'set-data':
                    this.instances[opt.type][opt.id].instance = new obj(opt.data);

                    return this.instances[opt.type][opt.id].instance;
            }

            this.notify({type: 'error', msg: 'Something go wrong when loading the Obj'});

            return false;
        },

        loadFile: function (type, name) {
            var path = this.option.paths[type] + name,
                extendPath = this.paths.extend ? this.paths.extend + path : false;

            if(type === 'component' ){
                path = path + '/index.js';
                if(extendPath) extendPath = extendPath+'/index.js';
            }

            if (loader === 'amd') return this._loadAmd(path, extendPath);
            if (loader === 'commonjs') return this._loadCommonjs(path, extendPath);

            this.notify({type: 'error', msg: 'Not loader defined for embed modules'});
            return false;
        },

        _loadAmd: function (path, extended) {
            var self = this;
            return define([path], function (obj) {

                return obj;

            }, function (err) {

                if (!extended) {
                    self.notify({type: 'error', msg: 'File: ' + path + ' not found!'});
                    return false;
                }

                return define([extended], function (_obj) {
                    return obj;
                }, function (err) {
                    self.notify({type: 'error', msg: 'File: ' + path + ' not found!', ref: err});
                });
            });
        },

        _loadCommonjs: function (path, extended) {
            var _file = require(path);
            if (!_file && extended) _file = require(extended);
            _file = _file ? _file : false;
            return _file;
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

            return request ? _.extend(request, {
                type: false,
                by: false,
                url: false,
                init: true
            }) : false;
        },

        _defineTypeRequest: function (opt) {
            var isView = (opt.type === 'view' || opt.type === 'component');

            if (isView && opt.el) return {type: 'view'};
            if (isView && !opt.el) {
                this.notify({
                    type: 'error',
                    msg: 'You are trying to execute a ' + opt.type + ' without an el',
                    ref: opt
                });
                return false;
            }

            // When data is set, is a set request
            if (opt.data && !opt.init) return {type: 'set', by: 'data'};

            // When init is set to fetch is a set request
            if (opt.init === 'fetch' || opt.init === true) return {type: 'set', by: 'fetch'};

            // When init is a string with match with fetch! would take the url by the string
            if (opt.init.indexOf('fetch!') > -1) return {type: 'set', by: 'fetch', url: opt.init.split('fetch!')[0]};

            // If is init and data omitted and opt.id and opt.name is a string is a get
            if (opt.init === 'extend') return {type: 'get', init: false};
            if ((!opt.init && !opt.data) && _.isString(opt.id) && _.isString(opt.name)) return {type: 'get', by: 'id'};

            this.notify({type: 'error', msg: 'Not a valid Ruest is defined check the rules', ref: opt});

            return false;
        }
    });

    // Save the previous value of the `MF` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var previousMF = root.MF;

    // Create local references to array methods we'll want to use later.
    var array = [];
    var slice = array.slice;

    // Current version of the library. Keep in sync with `package.json`.
    MF.VERSION = '0.1.1a';

    // For MF's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
    // the `$` variable.
    MF.$ = $;
    MF._ = _;
    MF.Backbone = Backbone;
    MF.Marionette = Marionette;

    // Runs MF.js in *noConflict* mode, returning the `MF` variable
    // to its previous owner. Returns a reference to this MF object.
    MF.noConflict = function () {
        root.MF = previousMF;
        return this;
    };

    return MF;

}));