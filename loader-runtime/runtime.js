import angular from 'angular';

let rootScope;
const hotProviders = {};

class HotServiceProvider {
  constructor ($injector, name, hotExport) {
    this.$injector = $injector;
    this._name = name;
    this._export = hotExport;
    this._constructor = this._export.get();

    hotProviders[name] = this;
  }

  check () {
    return this._constructor !== this._export.get();
  }

  $get () {
    if (!this._instance || this.check()) {
      this._instance = this.$injector.instantiate(this._export.get());
    }
    return this._instance;
  }
}

function loggingDecorator(key, original) {
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
        let instance = $delegate(Class, locals);
        if (instance.__hot) {
          instance = $delegate(instance.e, locals);
        }
        return instance;
      };
    });

    const originalService = $provide.service;
    $provide.service = function hotService(name, constructor) {
      if (constructor && constructor.__hot) {
        let hotExport = constructor();
        $provide.provider(name, new HotServiceProvider($injector, name, hotExport));
      } else {
        originalService.apply($provide, arguments);
      }
    };

    const originalGet = $injector.get;
    $injector.get = function hotGet(name) {
      if (hotProviders[name]) {
        return hotProviders[name].$get();
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

  reloaded() {
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
