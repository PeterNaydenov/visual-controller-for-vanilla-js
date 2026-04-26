"use strict"
/**
 *  Visual Controller for Vanilla JS
 *  Controls multiple vanilla JavaScript applications with a single controller.
 * 
 *  History notes:
 *   - Development started on April 25th, 2026
 *   - Published on GitHub for first time: April 25th, 2026
 */

import askForPromise from 'ask-for-promise'



/**
 * Visual Controller for Vanilla JS
 * @param {Object} [dependencies={}] - Dependencies that should be available for all apps
 * @returns {Object} - Object with methods: publish, destroy, getApp, has
 */
function VisualController ( dependencies ) {
        dependencies = dependencies || {}
        
        var cache = {}
        var updateInterface = {}


    /**
     * Publish a vanilla JS app
     * @param {Object} appDefinition - App definition with start and destroy functions
     * @param {Object} [data={}] - Data for the app
     * @param {string} id - Id of the container
     * @returns {Promise} - Promise that resolves to update methods
     */
    function publish (appDefinition, data, id) {
                data = data || {}
                
                var node = document.getElementById(id)
                var endTask = askForPromise()
                
                if (!appDefinition || !appDefinition.start) {
                        console.error('Error: App definition with start function is required')
                        endTask.done(false)
                        return endTask.promise
                }
                
                if (!node) {
                        console.error('Can\'t find node with id: "' + id + '"')
                        endTask.done(false)
                        return endTask.promise
                }
                
                if (cache[id]) {
                        destroy(id)
                }
                
                var updates = {}
                var setupUpdates = function(methods) {
                        updates = methods || {}
                }
                
                var props = {
                        id: id,
                        container: node,
                        dependencies: dependencies,
                        data: data,
                        setupUpdates: setupUpdates
                }
                
                try {
                        var cleanupHandle = appDefinition.start(props)
                        cache[id] = {
                                definition: appDefinition,
                                cleanupHandle: cleanupHandle
                        }
                        updateInterface[id] = updates
                } catch (e) {
                        console.error('Error starting app:', e)
                        endTask.done(false)
                        return endTask.promise
                }
                
                endTask.done(updates)
                return endTask.promise
            }


    /**
     * Destroy a vanilla JS app
     * @param {string} id - Id of the container
     * @returns {boolean} - Returns true on success and false on failure
     */
    function destroy (id) {
                var item = cache[id]
                if (!item) {
                        return false
                }
                
                var node = document.getElementById(id)
                
                if (item.definition && item.definition.destroy && item.cleanupHandle) {
                        try {
                                item.definition.destroy(item.cleanupHandle)
                        } catch (e) {
                                console.error('Error destroying app:', e)
                        }
                }
                
                if (node) {
                        node.innerHTML = ''
                }
                
                delete cache[id]
                delete updateInterface[id]
                return true
            }


    /**
     * Returns an object with update-methods for app defined by calling the setupUpdates function
     * @param {string} id - Id of the container
     * @returns {Object|false} - Object with update methods or false on failure
     */
    function getApp (id) {
                var item = updateInterface[id]
                if (!item) {
                        console.error('App with id: "' + id + '" was not found.')
                        return false
                }
                return item
            }


    /**
     * Checks if app with specific id was published
     * @param {string} id - Id of the container
     * @returns {boolean} - Returns true if app exists, false otherwise
     */
    function has (id) {
                return cache[id] ? true : false
            }


    return {
                  publish: publish
                , destroy: destroy
                , getApp: getApp
                , has: has
            }
}


export default VisualController