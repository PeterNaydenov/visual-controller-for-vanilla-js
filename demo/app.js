function Hello ( props ) {
    var container = props.container
    var data = props.data || {}
    var setupUpdates = props.setupUpdates
  
    var message = data.greeting || 'Hello'
    var count = 0

    container.innerHTML = `
      <div class="hello">
                  <h2> ${message} </h2>
                  <p> Count: ${count} </p>
                  <button> Increment </button>
            </div>
      `
    
    let 
        button = container.querySelector ( 'button' )
      , counter = container.querySelector ( 'p' )
      , title = container.querySelector ( 'h2' )
      ;
    
    button.addEventListener ( 'click', () => {
              counter.textContent = `Count: ${++count}`
        })

    setupUpdates ({
                  changeMessage: ( newMsg ) => {
                            message = newMsg
                            title.textContent = message
                      },
                  increment: () => {
                            counter.textContent = `Count: ${++count}`
                        },
                  getCount: () => {
                            return count
                        }
            })
  } // Hello func.



function destroyApp () {}



export default {
          start: Hello,
          destroy: destroyApp
    }


