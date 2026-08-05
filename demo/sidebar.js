function SidebarApp ( props ) {
        const { container, data, setupUpdates } = props;

        let
              title  = data.title || 'Sidebar'
            , items  = [ 'Apples', 'Oranges', 'Pears' ]
            , filter = ''
            ;

        container.innerHTML = `
            <div class="hello sidebar">
                <h3> ${title} </h3>
                <input class="filter" placeholder="filter..." />
                <ul></ul>
            </div>
        `;

        const
              listEl   = container.querySelector ( 'ul' )
            , inputEl  = container.querySelector ( 'input' )
            ;

        function render () {
                const visible = items.filter ( i => i.toLowerCase ().includes ( filter.toLowerCase () ) );
                listEl.innerHTML = visible
                        .map ( ( item, idx ) => `<li> ${item} <button data-idx="${idx}"> x </button> </li>` )
                        .join ( '' );
            }

        inputEl.addEventListener ( 'input', e => {
                filter = e.target.value
                render ()
            });

        listEl.addEventListener ( 'click', e => {
                const btn = e.target.closest ( 'button[data-idx]' )
                if ( !btn )   return
                const idx = Number ( btn.dataset.idx )
                items.splice ( idx, 1 )
                render ()
            });

        render ()

        setupUpdates ({
                  addItem: ( name ) => { if ( name ) { items.push ( name ); render () } }
                , removeItem: ( idx ) => { items.splice ( idx, 1 ); render () }
                , setFilter: ( text ) => { filter = text; inputEl.value = text; render () }
            });
    }


function destroySidebarApp () {
    }


export default {
          start: SidebarApp
        , destroy: destroySidebarApp
    };
