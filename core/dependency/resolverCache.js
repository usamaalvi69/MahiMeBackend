
module.exports = class resolveCache {

    isAlreadyResolved(controller_name) {
        let app_instance = null;
        __resolved_controllers.some(resolver => {
            if(resolver.controller_name == controller_name)
            {
                app_instance = resolver.app_instance;
                return;
            }
        })
        if(app_instance && Config.app('debug') == 'true') console.log('Resolution OK {cached}')
        return app_instance;
    }

    trackResolvedController(controller_name, app_instance) {
        __resolved_controllers.push({controller_name: controller_name, app_instance: app_instance})
    }

}