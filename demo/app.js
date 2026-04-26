function Hello ( props ) {
    const { container, data, setupUpdates } = props;
    /**
     * Props will contain a structure to:
     * - inject dependencies, 
     * - provide data for initial render
     * - 'setupUpdates' is a function to expose methods externally ( updates or other manipulations of existing app )
     */

    // Use some variables for local state maintance:
    let
         message = data.greeting || 'Hello'
       , count = 0
       ;

    // Render the app:
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
    
    button.addEventListener ( 'click', () =>  counter.textContent = `Count: ${++count}` )

    // Expose updates:
    setupUpdates ({
                  changeMessage: ( newMsg ) =>  title.textContent = newMsg,
                  increment: () => counter.textContent = `Count: ${++count}`,
                  getCount: () => count
            })
  } // Hello func.



function destroyApp () {
    // Remove the app's state to eliminate memory leaks if needed.
    
  }



export default {
          start: Hello,
          destroy: destroyApp
    }


