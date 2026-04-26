function Test(props) {
  var container = props.container
  var data = props.data || {}
  var setupUpdates = props.setupUpdates

  var message = data.greeting || 'Hello'
  var count = 0

  var ins = document.createElement('div')
  ins.id = 'ins'
  ins.textContent = message
  
  var btn = document.createElement('button')
  btn.textContent = 'Increment'

  container.appendChild(ins)
  container.appendChild(btn)

  setupUpdates({
    setupText: function(newText) {
      ins.textContent = newText
    },
    increment: function() {
      count++
    },
    getCount: function() {
      return count
    }
  })
}

function destroyTest() {
}

function NoUpdates(props) {
  var container = props.container
  var setupUpdates = props.setupUpdates

  var div = document.createElement('div')
  div.textContent = 'No updates'
  container.appendChild(div)

  setupUpdates({})
}

export default {
  start: Test,
  destroy: destroyTest
}
export { Test as TestFn, NoUpdates as NoUpdatesFn }