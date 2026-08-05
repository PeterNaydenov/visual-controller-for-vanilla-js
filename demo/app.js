function HeaderApp ( props ) {
        const { container, data, setupUpdates, dependencies } = props;
        const { capitalize } = dependencies;

        let
              hasCaps   = capitalize instanceof Function
            , message   = ( hasCaps ? capitalize ( data.greeting ) : data.greeting ) || 'Hello'
            , count     = 0
            ;

        container.innerHTML = `
            <div class="hello">
                <h3> ${message} </h3>
                <p> Count: ${count} </p>
                <button> Increment </button>
            </div>
        `;

        const
              button  = container.querySelector ( 'button' )
            , counter = container.querySelector ( 'p' )
            , title   = container.querySelector ( 'h3' )
            ;

        button.addEventListener ( 'click', () => {
                counter.textContent = `Count: ${++count}`
            });

        setupUpdates ({
                  changeMessage: ( newMsg ) => { title.textContent = newMsg }
                , increment:     ()        => { counter.textContent = `Count: ${++count}` }
                , getCount:      ()        => count
            });
    }


function destroyHeaderApp () {
    }


export default {
          start: HeaderApp
        , destroy: destroyHeaderApp
    };
