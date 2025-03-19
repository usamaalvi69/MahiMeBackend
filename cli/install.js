const installer = resolveOnce('core.installer')

module.exports = class install {

    /**
     * @description Any declarations or contructor logic goes here
     */
    setup(callback) {
        if (callback !== undefined) callback()        
    }

    /**
     * @description Default method, which automatically executed
     */
    index(name) {
        
    }

    /**
     * @description Default method, which automatically executed
     */
    async package(name) {
        await installer.install(name)
    }

}