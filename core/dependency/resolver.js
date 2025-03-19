module.exports = class Resolver {
    resolve(configs, controller_name) {
        controller_name = (controller_name === undefined ? '' : controller_name)
        configs = (configs === undefined ? [] : configs)
        let appInstance = {};
        this.controller_name = controller_name
        configs.forEach(config => {
            appInstance = this.resolveStart(config)
        })
        return appInstance;
    }

    resolveStart(config) {
        let instance = {};
        if (config.resolve !== undefined && config.resolve.length > 0) {
            config.resolve.forEach(res => {
                this.preResolveDependencies(res)
                if (res.controllers !== undefined && res.controllers.length > 0) {
                    res.controllers.forEach(controller => {
                        if (this.controller_name == this.getNameFromPath(controller)) {
                            if (Config.app('debug') == 'true') console.log('resolving dependencies ...');
                            if (Config.app('debug') == 'true') console.log('- resolving ' + this.controller_name + '...');
                            instance = this.resolveController(res.dependencies)
                        }
                    })
                }
            })
        }
        return instance
    }

    preResolveDependencies(resolve) {
        if (resolve.pre_resolve !== undefined && resolve.pre_resolve) {
            if (Config.app('debug') == 'true') console.log('Pre-resolving dependencies ...');
            this.resolveDependencies(resolve.dependencies)
        }
        return false
    }

    resolveController(dependencies) {
        let instance = {};
        if (dependencies !== undefined && dependencies.length > 0) {
            let resolvedInjections = this.resolveDependencies(dependencies);
            let controller_app = resolve('core.dependency.resolvedInstance', resolvedInjections);
            instance = controller_app;
        } else {
            instance = {};
        }
        if (Config.app('debug') == 'true') console.log('Resolution OK')
        return instance;
    }

    resolveDependencies(dependencies) {
        if (dependencies !== undefined && dependencies.length > 0) {
            let me = this
            let injections = []
            dependencies.forEach(item => {
                if (item.targets !== undefined && item.targets.length > 0) {
                    item.targets.forEach(target => {
                        let injectedName = ''
                        let targetName = ''
                        let targetFile = ''
                        if (typeof target === 'string') {
                            targetFile = 'app.' + target
                            let temp = target.split('.')
                            targetName = temp[temp.length - 1]
                            injectedName = targetName
                        } else {
                            targetFile = 'app.' + target.source
                            let temp = target.source.split('.')
                            targetName = temp[temp.length - 1]
                            injectedName = target.alias
                        }
                        if (Config.app('debug') == 'true') console.log('- resolving ' + targetName + ' ...');
                        let instance = null;
                        if (item.dependencies !== undefined && item.dependencies.length > 0) {
                            let resolvedInjections = me.resolveDependencies(item.dependencies);
                            let app = resolve('core.dependency.resolvedInstance', resolvedInjections);
                            instance = resolve(targetFile, app)
                        } else {
                            instance = resolve(targetFile)
                        }

                        if (item.name !== undefined) {
                            this.addGlobalDependency(item.name, injectedName, instance)
                        }

                        injections[injectedName] = instance
                    })
                }
                injections = this.pullPreResolvedDependencies(item, injections)
            })
            return injections;
        }
        return []
    }

    pullPreResolvedDependencies(item, injections) {
        if (item.pull !== undefined) {
            let dependency = this.getGlobalDependency(item.pull)
            if (Config.app('debug') == 'true') console.log('- pulling (' + item.pull + ') ...')
            if (dependency != null) {
                dependency.dependencies.forEach(dep => {
                    injections[dep.name] = dep.instance
                })
            }
        }
        return injections
    }

    getGlobalDependency(name) {
        let dep = null
        __dependencies.some(gd => {
            if (gd.name == name) {
                dep = gd
                return
            }
        })
        return dep
    }

    addGlobalDependency(name, injectedName, instance) {
        let exists = false
        __dependencies.some(gd => {
            if (gd.name == name) {
                let dep_exists = false
                gd.dependencies.some(dep => {
                    if (dep.name == injectedName) {
                        dep_exists = true
                        return
                    }
                })
                if (!dep_exists) {
                    gd.dependencies.push({ name: injectedName, instance: instance })
                } else {
                    if (Config.app('debug') == 'true') console.log('x cancelled (already resolved).')
                }
                exists = true
                return
            }
        })
        if (!exists) {
            __dependencies.push({ name: name, dependencies: [] })
            __dependencies[__dependencies.length - 1].dependencies.push({ name: injectedName, instance: instance })
        }
    }

    getNameFromPath(path) {
        let arr = path.split('.')
        return arr[arr.length - 1]
    }
};