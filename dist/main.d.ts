export default VisualController;
/**
 * App definition structure
 */
export type AppDefinition = {
    /**
     * - Start function that receives props
     */
    start: Function;
    /**
     * - Destroy function for cleanup
     */
    destroy: Function;
};
/**
 * Visual Controller for Vanilla JS
 * @param {Object} [dependencies={}] - Dependencies that should be available for all apps
 * @returns {Object} - Object with methods: publish, destroy, getApp, has
 */
/**
 * App definition structure
 * @typedef {Object} AppDefinition
 * @property {Function} start - Start function that receives props
 * @property {Function} destroy - Destroy function for cleanup
 */
declare function VisualController(dependencies?: {}): {
    publish: (appDefinition: AppDefinition, data: any, id: string) => any;
    destroy: (id: string) => boolean;
    getApp: (id: string) => any | false;
    has: (id: string) => boolean;
};
