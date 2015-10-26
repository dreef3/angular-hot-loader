import angular from 'angular';

let rootScope;

const TYPES = {
    PROVIDER: 'PROVIDER', 'CONTROLLER': 'CONTROLLER'
};

const CACHE = {};
CACHE[TYPES.CONTROLLER] = {};
CACHE[TYPES.PROVIDER] = {};

class HotServiceProvider {
    constructor ($injector, name, hotExport) {
        this.$injector = $injector;
        this._name = name;
        this._export = hotExport;
        this._constructor = this._export.get();

        CACHE[TYPES.PROVIDER][name] = this;
    }

    check () {
        return !this._timestamp || this._timestamp < this._export.timestamp;
    }

    $get () {
        if (!this._instance || this.check()) {
            this._timestamp = new Date();
            this._instance = this.$injector.instantiate(this._export.get());
        }
        return this._instance;
    }
}

function loggingDecorator (key, original) {
    return function () {
        const result = original.apply(this, arguments);
        console.log(`[${key}][${original.name}]`, ...arguments, result);
        return result;
    };
}

angular.module('hmr-runtime', [])
    .config(($provide, $injector) => {
        $provide.decorator('$controller', ($delegate, $injector) => {
            return function (Class, locals) {
                let constructor = Class;
                let hotExport;
                let isHot = false;
                if (typeof Class === 'string') {
                    if (CACHE[TYPES.CONTROLLER][Class]) {
                        isHot = true;
                        [constructor, hotExport] = CACHE[TYPES.CONTROLLER][Class];
                    } else {
                        constructor = $delegate(Class, locals);
                        if (constructor && constructor.__hot) {
                            hotExport = constructor;
                            constructor = hotExport.get();
                            isHot = true;
                            CACHE[TYPES.CONTROLLER] = [constructor, hotExport];
                        }
                    }
                }

                if (!isHot) {
                    return $delegate.apply(this, arguments);
                }

                if (hotExport.get() !== constructor) {
                    constructor = hotExport.get();
                    CACHE[TYPES.CONTROLLER][Class] = [constructor, hotExport];
                }

                let injectables = $injector.annotate(constructor).reduce((result, name) => {
                    if (locals[name]) {
                        result[name] = locals[name];
                    } else if (CACHE[TYPES.PROVIDER][name]) {
                        result[name] = CACHE[TYPES.PROVIDER][name].$get();
                    }
                    return result;
                }, {});

                return $injector.instantiate(constructor, Object.assign(injectables, locals));
            };
        });

        const originalService = $provide.service;
        $provide.service = function hotService (name, constructor) {
            if (constructor && constructor.__hot) {
                let hotExport = constructor();
                $provide.provider(name, new HotServiceProvider($injector, name, hotExport));
            } else {
                originalService.apply($provide, arguments);
            }
        };

        const originalGet = $injector.get;
        $injector.get = function hotGet (name) {
            if (CACHE[TYPES.PROVIDER][name]) {
                return CACHE[TYPES.PROVIDER][name].$get();
            }
            return originalGet.apply(this, arguments);
        };

        for (let method of ['get', 'invoke', 'has', 'instantiate', 'annotate']) {
            $injector[method] = loggingDecorator('$injector', $injector[method]);
        }
    })
    .run(($rootScope, $state) => {
        rootScope = $rootScope;
        $rootScope.$on('$$moduleReloaded', (e, m) => {
            $state.reload();
        });
    });

export default class HmrRuntime {
    constructor (m) {
        this._module = m;
    }

    reloaded () {
        if (rootScope) {
            rootScope.$emit('$$moduleReloaded', this._module);
        }
    }

    accepted (args) {
        console.log(args);
    }

    disposed (args) {
        console.log(args);
    }

    static register (m) {
        return new HmrRuntime(m);
    }
}
