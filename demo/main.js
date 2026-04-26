import VisualController from '/src/main.js'
import Hello from '/demo/app.js'

var html = VisualController({
  utils: {
    capitalize: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  }
})

var hasTextBlock = document.getElementById('hasText')
var updateMsgBtn = document.getElementById('updateMsg')
var incrementBtn = document.getElementById('increment')
var getCountBtn = document.getElementById('getCount')
var destroyBtn = document.getElementById('destroy')
var resultTextBlock = document.getElementById('resultText')

html.publish ( Hello, { greeting: 'Hi from Vanilla JS!' }, 'app' )
  .then ( updates => {
              console.log ( 'App loaded with updates:', updates )
              hasTextBlock.textContent = html.has ( 'app' )
    })

updateMsgBtn.addEventListener ( 'click', () => {
              let app = html.getApp('app')
              if ( app )  app.changeMessage ( `Updated at ${ new Date().toLocaleTimeString()}` )
    })

incrementBtn.addEventListener ( 'click', () => {
              let app = html.getApp('app')
              if ( app )  app.increment()
    })

getCountBtn.addEventListener('click', () => {
              let app = html.getApp ( 'app' )
              if ( app )  resultTextBlock.textContent = app.getCount ()
    })



destroyBtn.addEventListener ( 'click', () => {
              const result = html.destroy ( 'app' )
              resultTextBlock.textContent = 'Destroyed: ' + result
              hasTextBlock.textContent = html.has ( 'app' )
    })