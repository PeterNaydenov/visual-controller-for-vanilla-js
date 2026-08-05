import { describe, it, expect, beforeEach, vi } from 'vitest'
import VisualController from '../src/main.js'
import TestDef, { NoUpdates, ErrorAppFn, ErrorDestroyAppFn, destroyErrorFn, TestFn } from './components.js'

const Test = { start: TestDef.start, destroy: TestDef.destroy }
const NoUpdatesDef = { start: NoUpdates }
const ErrorAppDef = { start: ErrorAppFn, destroy: destroyErrorFn }
const ErrorDestroyAppDef = { start: ErrorDestroyAppFn, destroy: destroyErrorFn }

const tick = () => new Promise(resolve => setTimeout(resolve, 0))
const resetAll = () => {
    document.body.innerHTML = '<main id="main"></main>'
    let main = document.querySelector('#main')
    if (!main) {
        main = document.createElement('main')
        main.id = 'main'
        document.body.appendChild(main)
    }
    main.innerHTML = ''
}


describe('Visual Controller for Vanilla JS — v2 region API', () => {

    let html

    beforeEach(() => {
        resetAll()
        html = new VisualController({})
    })

    it('set registers a region and adds the alias to list()', () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        expect(html.list()).toContain('header')
    })

    it('set forwards extra args to the callback', () => {
        let received
        html.set(({ start, end }, locale) => {
            received = locale
            document.body.append(start, end)
            return 'l10n-test'
        }, 'en')
        expect(received).toBe('en')
    })

    it('publish mounts an app into a declared alias', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        await html.publish('header', Test)
        expect(html.has('header')).toBe(true)
    })

    it('publish into undeclared alias resolves to false and logs', async () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const result = await html.publish('nope', Test)
        expect(result).toBe(false)
        expect(errSpy).toHaveBeenCalled()
        errSpy.mockRestore()
    })

    it('publish with no appDef resolves to false and logs', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const result = await html.publish('header', undefined)
        expect(result).toBe(false)
        errSpy.mockRestore()
    })

    it('publish with non-string alias resolves to false and logs', async () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const result = await html.publish(null, Test)
        expect(result).toBe(false)
        errSpy.mockRestore()
    })

    it('publish with appDef missing start resolves to false and logs', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const result = await html.publish('header', { destroy: () => {} })
        expect(result).toBe(false)
        errSpy.mockRestore()
    })

    it('publish without data works (defaults to {})', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        const app = await html.publish('header', Test)
        expect(typeof app.setupText).toBe('function')
    })

    it('publish accepts and ignores extraParams', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        const app = await html.publish('header', Test, {}, { future: true })
        expect(app.setupText).toBeDefined()
    })

    it('republish destroys the first app and mounts the second', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        await html.publish('header', Test)
        const app1 = html.getApp('header')
        await html.publish('header', Test)
        const app2 = html.getApp('header')
        expect(app1).not.toBe(app2)
        expect(html.has('header')).toBe(true)
    })

    it('destroy empties the range, has() becomes false, alias stays in list()', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        await html.publish('header', Test)
        expect(html.has('header')).toBe(true)
        expect(html.destroy('header')).toBe(true)
        expect(html.has('header')).toBe(false)
        expect(html.list()).toContain('header')
    })

    it('destroy on an unknown alias returns false', () => {
        expect(html.destroy('never-published')).toBe(false)
    })

    it('getApp returns the setupUpdates interface', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        await html.publish('header', Test)
        const app = html.getApp('header')
        expect(typeof app).toBe('object')
        expect(typeof app.setupText).toBe('function')
        expect(app.getCount()).toBe(0)
    })

    it('getApp on missing alias returns false and logs', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(html.getApp('never')).toBe(false)
        expect(errSpy).toHaveBeenCalled()
        errSpy.mockRestore()
    })

    it('supports multiple regions in the same parent', async () => {
        const main = document.querySelector('#main')
        html.set(({ start, end }) => { main.append(start, end); return 'header' })
        html.set(({ start, end }) => { main.append(start, end); return 'sidebar' })
        expect(html.list()).toEqual(expect.arrayContaining(['header', 'sidebar']))
        await html.publish('header', Test)
        await html.publish('sidebar', Test)
        expect(html.has('header')).toBe(true)
        expect(html.has('sidebar')).toBe(true)
        // Two separate mount containers, one per region
        const mounts = Array.from(main.querySelectorAll('div')).filter(d => d.parentNode === main)
        expect(mounts.length).toBe(2)
    })

    it('orphaned markers (parent removed) make publish resolve to false', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        document.querySelector('#main').remove()
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const result = await html.publish('header', Test)
        expect(result).toBe(false)
        expect(html.has('header')).toBe(false)
        errSpy.mockRestore()
    })

    it('reset unmounts all apps and clears list()', async () => {
        const main = document.querySelector('#main')
        html.set(({ start, end }) => { main.append(start, end); return 'header' })
        html.set(({ start, end }) => { main.append(start, end); return 'sidebar' })
        await html.publish('header', Test)
        await html.publish('sidebar', Test)
        expect(html.list().length).toBe(2)

        html.reset()
        expect(html.list().length).toBe(0)
        expect(html.has('header')).toBe(false)
        expect(html.has('sidebar')).toBe(false)
        // No mount containers left
        const remaining = Array.from(main.querySelectorAll('div'))
        expect(remaining.length).toBe(0)
    })

    it('reset clears the cache so a fresh set() can reuse an alias', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        await html.publish('header', Test)
        html.reset()
        // After reset, alias is gone. Re-register and re-publish.
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        const app = await html.publish('header', Test)
        expect(app.setupText).toBeDefined()
    })

    it('changeMessage via setupUpdates updates the rendered DOM', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        const app = await html.publish('header', Test)
        app.setupText('New text')
        expect(document.querySelector('#ins').textContent).toBe('New text')
    })

    it('SSR hydration: pre-populated range uses existing element as the mount target', async () => {
        let endNode
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            endNode = end
            return 'header'
        })

        // Insert an existing element between the markers (simulating SSR)
        const ssrRoot = document.createElement('div')
        ssrRoot.id = 'ssr-root'
        ssrRoot.textContent = 'pre-rendered'
        document.querySelector('#main').insertBefore(ssrRoot, endNode)

        expect(document.querySelector('#main').contains(ssrRoot)).toBe(true)

        // Use an app that just records what container it received
        let receivedContainer
        const ProbeApp = {
            start (props) {
                receivedContainer = props.container
                props.setupUpdates({})
            }
        }

        await html.publish('header', ProbeApp)

        // The probe app should have received the existing SSR element as its container
        expect(receivedContainer).toBe(ssrRoot)
    })

    it('SSR hydration: multiple sibling nodes get wrapped in a mount container', async () => {
        let endNode
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            endNode = end
            return 'header'
        })

        // Insert two sibling elements (fragment-style SSR)
        const a = document.createElement('p')
        a.textContent = 'first'
        const b = document.createElement('p')
        b.textContent = 'second'
        document.querySelector('#main').insertBefore(a, endNode)
        document.querySelector('#main').insertBefore(b, endNode)

        let receivedContainer
        const ProbeApp = {
            start (props) {
                receivedContainer = props.container
                props.setupUpdates({})
            }
        }

        await html.publish('header', ProbeApp)

        // The probe app should have received a wrapper container, not the bare siblings
        expect(receivedContainer).toBeTruthy()
        expect(receivedContainer.tagName).toBe('DIV')
        // The wrapper holds both siblings
        expect(receivedContainer.contains(a)).toBe(true)
        expect(receivedContainer.contains(b)).toBe(true)
        // Wrapper sits between the markers, as a direct child of #main
        expect(receivedContainer.parentNode).toBe(document.querySelector('#main'))
    })

    it('isEmpty returns true for an empty region and false after publish', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        expect(html.isEmpty('header')).toBe(true)
        await html.publish('header', Test)
        expect(html.isEmpty('header')).toBe(false)
        html.destroy('header')
        expect(html.isEmpty('header')).toBe(true)
    })

    it('isEmpty returns true for an orphaned range', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        document.querySelector('#main').remove()
        expect(html.isEmpty('header')).toBe(true)
    })

    it('isEmpty returns undefined and logs for an unknown alias', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(html.isEmpty('nope')).toBe(undefined)
        expect(errSpy).toHaveBeenCalled()
        errSpy.mockRestore()
    })

    it('isEmpty returns undefined and logs for a non-string alias', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(html.isEmpty(null)).toBe(undefined)
        expect(errSpy).toHaveBeenCalled()
        errSpy.mockRestore()
    })

    it('destroy() with no args destroys every published app and returns the count', async () => {
        const main = document.querySelector('#main')
        html.set(({ start, end }) => { main.append(start, end); return 'header' })
        html.set(({ start, end }) => { main.append(start, end); return 'sidebar' })
        await html.publish('header', Test)
        await html.publish('sidebar', Test)
        expect(html.has('header')).toBe(true)
        expect(html.has('sidebar')).toBe(true)

        const count = html.destroy()
        expect(count).toBe(2)
        expect(html.has('header')).toBe(false)
        expect(html.has('sidebar')).toBe(false)
        // Aliases remain in list() — markers are still in the DOM
        expect(html.list()).toEqual(expect.arrayContaining(['header', 'sidebar']))
        expect(main.querySelectorAll('div').length).toBe(0)
    })

    it('destroy() with no args returns 0 when nothing is published', () => {
        expect(html.destroy()).toBe(0)
    })

    it('destroy(["alias1", "alias2"]) destroys only those, returns the count', async () => {
        const main = document.querySelector('#main')
        html.set(({ start, end }) => { main.append(start, end); return 'header' })
        html.set(({ start, end }) => { main.append(start, end); return 'sidebar' })
        html.set(({ start, end }) => { main.append(start, end); return 'footer' })
        await html.publish('header', Test)
        await html.publish('sidebar', Test)
        await html.publish('footer', Test)

        const count = html.destroy(['header', 'footer'])
        expect(count).toBe(2)
        expect(html.has('header')).toBe(false)
        expect(html.has('footer')).toBe(false)
        expect(html.has('sidebar')).toBe(true)
    })

    it('destroy([...]) silently skips missing aliases', async () => {
        const main = document.querySelector('#main')
        html.set(({ start, end }) => { main.append(start, end); return 'header' })
        await html.publish('header', Test)

        const count = html.destroy(['header', 'unknown', 'also-missing'])
        expect(count).toBe(1)
        expect(html.has('header')).toBe(false)
    })

    it('destroy([]) is a no-op and returns 0', () => {
        expect(html.destroy([])).toBe(0)
    })

    it('destroy(invalid type) logs an error and returns false', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(html.destroy(123)).toBe(false)
        expect(html.destroy(null)).toBe(false)
        expect(html.destroy({})).toBe(false)
        expect(errSpy).toHaveBeenCalled()
        errSpy.mockRestore()
    })

    it('publish handles start function error gracefully', async () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        const result = await html.publish('header', ErrorAppDef)
        expect(result).toBe(false)
        expect(html.has('header')).toBe(false)
        errSpy.mockRestore()
    })

    it('publish passes shared dependencies to the app', async () => {
        const htmlWithDeps = new VisualController({ capitalize: s => s.toUpperCase() })
        htmlWithDeps.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })

        let receivedDeps
        const ProbeApp = {
            start (props) {
                receivedDeps = props.dependencies
                props.setupUpdates({})
            }
        }

        await htmlWithDeps.publish('header', ProbeApp)
        expect(typeof receivedDeps.capitalize).toBe('function')
        expect(receivedDeps.capitalize('hi')).toBe('HI')
    })

    it('publish passes data and alias to the app props', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'my-alias'
        })

        let receivedProps
        const ProbeApp = {
            start (props) {
                receivedProps = props
                props.setupUpdates({})
            }
        }

        await html.publish('my-alias', ProbeApp, { greeting: 'Hi' })
        expect(receivedProps.alias).toBe('my-alias')
        expect(receivedProps.data).toEqual({ greeting: 'Hi' })
        expect(receivedProps.container).toBeTruthy()
        expect(typeof receivedProps.setupUpdates).toBe('function')
    })

    it('destroy() calls the app-defined destroy() function', async () => {
        let destroyCalled = 0
        const SpyApp = {
            start (props) { props.setupUpdates({}) },
            destroy () { destroyCalled++ }
        }
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        await html.publish('header', SpyApp)
        html.destroy('header')
        expect(destroyCalled).toBe(1)
    })

    it('destroy() survives an error in the app-defined destroy() function', async () => {
        html.set(({ start, end }) => {
            document.querySelector('#main').append(start, end)
            return 'header'
        })
        await html.publish('header', ErrorDestroyAppDef)
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const ok = html.destroy('header')
        expect(ok).toBe(true)
        expect(html.has('header')).toBe(false)
        errSpy.mockRestore()
    })
})
