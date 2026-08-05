export default VisualController;
/**
 * Callback that places dim markers into the DOM.
 */
export type SetCallback = (markers: {
    start: Text;
    end: Text;
}) => string | void;
/**
 * Object passed to `setupUpdates` from inside a published app.
 */
export type SetupUpdates = any;
/**
 * Controller instance returned by `VisualController`.
 */
export type VisualControllerInstance = {
    set: SetCallback & ((fn: SetCallback, ...args: any[]) => void);
    publish: (alias: string, appDef: any, data?: object, extraParams?: object) => Promise<SetupUpdates | false>;
    destroy: (target?: string | string[]) => boolean | number;
    has: (alias: string) => boolean;
    getApp: (alias: string) => SetupUpdates | false;
    isEmpty: (alias: string) => boolean | undefined;
    list: () => string[];
    reset: () => void;
};
/**
 *  Callback that places dim markers into the DOM.
 *  @callback SetCallback
 *  @param {{ start: Text, end: Text }} markers
 *  @returns {string | void}
 */
/**
 *  Object passed to `setupUpdates` from inside a published app.
 *  @typedef {Object} SetupUpdates
 */
/**
 *  Controller instance returned by `VisualController`.
 *  @typedef {Object} VisualControllerInstance
 *  @property {SetCallback & ((fn: SetCallback, ...args: any[]) => void)} set
 *  @property {(alias: string, appDef: any, data?: object, extraParams?: object) => Promise<SetupUpdates | false>} publish
 *  @property {(target?: string | string[]) => boolean | number} destroy
 *  @property {(alias: string) => boolean} has
 *  @property {(alias: string) => SetupUpdates | false} getApp
 *  @property {(alias: string) => boolean | undefined} isEmpty
 *  @property {() => string[]} list
 *  @property {() => void} reset
 */
/**
 *  Visual Controller for Vanilla JS
 *  @param {Object} [dependencies={}]
 *  @returns {VisualControllerInstance}
 */
declare function VisualController(dependencies?: any): VisualControllerInstance;
