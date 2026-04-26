import VisualController from '/src/main.js'
import Hello from '/demo/app.js'

var html = VisualController ({
  utils: {
            capitalize: ( str ) => str.charAt(0).toUpperCase() + str.slice (1)
        }
  })



const 
      hasTextBlock    = document.getElementById ( 'hasText'   )
    , updateMsgBtn    = document.getElementById ( 'updateMsg' )
    , incrementBtn    = document.getElementById ( 'increment' )
    , getCountBtn     = document.getElementById ( 'getCount'  )
    , destroyBtn      = document.getElementById ( 'destroy'   )
    , resultTextBlock = document.getElementById ( 'resultText')
    ;



html.publish ( Hello, { greeting: 'Hi from Vanilla JS!' }, 'app' )
  .then ( updates => {
              console.log ( 'App loaded with updates:', updates )
              hasTextBlock.textContent = html.has ( 'app' )
    })


const app = html.getApp ( 'app' );


updateMsgBtn.addEventListener ( 'click', () => {
              if ( app )  app.changeMessage ( `Updated at ${ new Date().toLocaleTimeString()}` )
    })

incrementBtn.addEventListener ( 'click', () => {
              if ( app )  app.increment ()
    })

getCountBtn.addEventListener('click', () => {
              if ( app )  resultTextBlock.textContent = app.getCount ()
    })



destroyBtn.addEventListener ( 'click', () => {
              const result = html.destroy ( 'app' )
              resultTextBlock.textContent = `Destroyed: ${result}`
              hasTextBlock.textContent = html.has ( 'app' )
    })