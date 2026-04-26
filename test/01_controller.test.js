import { describe, it, expect, beforeEach } from 'vitest'
import VisualController from "../src/main.js"
import TestDef, { NoUpdates } from './components.js'
var Test = { start: TestDef.start, destroy: TestDef.destroy }
var NoUpdatesDef = { start: NoUpdates }
import fs from 'fs'
import path from 'path'









beforeEach(() => {
  const html = fs.readFileSync(path.join(__dirname, 'fixtures', 'index.html'), 'utf-8')
  document.body.innerHTML = html
})

describe ( 'Visual controller for Vanilla JS', () => {

    it ( 'Method "publish" returns a promise', async () => {
        const root = document.querySelector('#root')
        const vc = VisualController({})

        const el = await vc.publish(Test, { greeting: 'Hello' }, 'root')
        
        expect(el).toHaveProperty('setupText')
    })


    it ( 'Method "has"', async () => {
        const root = document.querySelector('#app')
        const vc = VisualController({})

        const before = vc.has('app')
        
        await vc.publish(Test, {}, 'app')

        const after = vc.has('app')
        
        expect(before).toBe(false)
        expect(after).toBe(true)

        vc.destroy('app')
    })


    it ( 'Method "getApp" returns empty object when no setupUpdates', async () => {
        const root = document.querySelector('#root')
        const vc = VisualController({})

        await vc.publish(NoUpdatesDef, {}, 'root')
        
        const app = vc.getApp('root')
        
        expect(Object.keys(app).length).toBe(0)

        vc.destroy('root')
    })


    it ( 'Method "getApp" returns update methods', async () => {
        const root = document.querySelector('#root')
        const vc = VisualController({})

        await vc.publish(Test, { greeting: 'Hi' }, 'root')
        
        const app = vc.getApp('root')
        
        expect(app).toHaveProperty('setupText')
        expect(app).toHaveProperty('increment')
        expect(app).toHaveProperty('getCount')
    })


    it ( 'Method "destroy" returns true on success', async () => {
        const root = document.querySelector('#root')
        const vc = VisualController({})

        await vc.publish(Test, {}, 'root')
        
        const result = vc.destroy('root')
        
        expect(result).toBe(true)
    })


    it ( 'Method "destroy" returns false when not found', async () => {
        const vc = VisualController({})

        const result = vc.destroy('non-existent')
        
        expect(result).toBe(false)
    })


    it ( 'Update component state from outside', async () => {
        const root = document.querySelector('#root')
        const vc = VisualController({})

        await vc.publish(Test, { greeting: 'Hello' }, 'root')
        
        const app = vc.getApp('root')
        app.setupText('Updated')
        
        const textEl = document.getElementById('ins')
        expect(textEl.textContent).toBe('Updated')

        vc.destroy('root')
    })

})