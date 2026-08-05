/**
 *  Demo application for Visual Controller for Vanilla JS — v2 region API
 *
 *  Shows all specifics of the visual controller:
 *  - How to define regions with `set` (no DOM ids, no wrappers);
 *  - How to inject shared dependencies into apps;
 *  - How to publish apps into regions;
 *  - How to swap apps between regions at runtime;
 *  - How to destroy apps;
 *  - How to expose an API for manipulating apps from the outside;
 *  - App structure compatible with the visual controller.
 */

import VisualController from '/src/main.js'
import HeaderApp from '/demo/app.js'
import SidebarApp from '/demo/sidebar.js'

const
      html              = new VisualController ({})
    , main              = document.getElementById ( 'main' )
    , updateHeaderBtn   = document.getElementById ( 'updateHeader' )
    , incrementBtn      = document.getElementById ( 'incrementHeader' )
    , swapBtn           = document.getElementById ( 'swapApps' )
    , destroyHeaderBtn  = document.getElementById ( 'destroyHeader' )
    , destroySidebarBtn = document.getElementById ( 'destroySidebar' )
    , resetBtn          = document.getElementById ( 'resetAll' )
    , resultText        = document.getElementById ( 'resultText' )
    , aliasesList       = document.getElementById ( 'aliasesList' )
    ;

// Tracks which alias currently hosts each app definition, so the control
// buttons follow the app instead of a fixed region. Updates on swap / republish.
let
      headerAlias = 'header'   // HeaderApp is initially published under 'header'
    , sidebarAlias = 'sidebar' // SidebarApp is initially published under 'sidebar'
    ;

function refreshAliases () {
        aliasesList.textContent = html.list ().join ( ', ' ) || '-'
    }

function headerApp () {
        // Resolves the HeaderApp's setupUpdates interface no matter which
        // region it currently lives in.
        return html.getApp ( headerAlias )
    }

function sidebarApp () {
        return html.getApp ( sidebarAlias )
    }



// 1. Define two regions inside one parent. No <div id="..."> wrappers.
html.set ( ( { start, end } ) => {
        main.append ( start, end )
        return 'header'
    })

html.set ( ( { start, end } ) => {
        main.append ( start, end )
        return 'sidebar'
    })

refreshAliases ()


// 2. Publish apps into the regions.
html.publish ( 'header', HeaderApp, { greeting: 'Hi from Vanilla JS!' })
    .then ( updates => {
            resultText.textContent = 'Header published: ' + JSON.stringify ( Object.keys ( updates ) )
            refreshAliases ()
        })

html.publish ( 'sidebar', SidebarApp, { title: 'Items' })
    .then ( updates => {
            console.log ( 'Sidebar published:', updates )
            refreshAliases ()
        })



updateHeaderBtn.addEventListener ( 'click', () => {
        // Follow HeaderApp — it may have been swapped into the other region.
        const app = headerApp ()
        if ( app && typeof app.changeMessage === 'function' ) {
                app.changeMessage ( `Header updated at ${new Date().toLocaleTimeString()}` )
            }
        else {
                resultText.textContent = 'Header app not currently published'
            }
    })

incrementBtn.addEventListener ( 'click', () => {
        const app = headerApp ()
        if ( app && typeof app.increment === 'function' ) {
                app.increment ()
            }
    })


let swapped = false
swapBtn.addEventListener ( 'click', () => {
        swapped = !swapped
        // Exchange the apps between the two regions. Initial state:
        // header hosts HeaderApp, sidebar hosts SidebarApp. After swap,
        // header hosts SidebarApp and sidebar hosts HeaderApp. Toggle again
        // to restore.
        const [ first, second ] = swapped
                ? [ SidebarApp, HeaderApp ]
                : [ HeaderApp, SidebarApp ]
        html.publish ( 'header', first )
        html.publish ( 'sidebar', second )
        // Keep the alias pointers in sync so the header/sidebar buttons
        // continue to target the correct app after the swap.
        headerAlias = swapped ? 'sidebar' : 'header'
        sidebarAlias = swapped ? 'header' : 'sidebar'
        resultText.textContent = swapped
                ? 'Swapped: header and sidebar exchanged apps'
                : 'Restored: header and sidebar back to initial apps'
    })


destroyHeaderBtn.addEventListener ( 'click', () => {
        const ok = html.destroy ( headerAlias )
        resultText.textContent = 'Destroy header: ' + ok
        refreshAliases ()
    })


destroySidebarBtn.addEventListener ( 'click', () => {
        const ok = html.destroy ( sidebarAlias )
        resultText.textContent = 'Destroy sidebar: ' + ok
        refreshAliases ()
    })


resetBtn.addEventListener ( 'click', () => {
        html.reset ()
        resultText.textContent = 'Reset all'
        refreshAliases ()
    })
