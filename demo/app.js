function Hello(props) {
  var container = props.container
  var data = props.data
  var setupUpdates = props.setupUpdates
  var dependencies = props.dependencies

  var message = data.greeting || 'Hello'
  var count = 0

  var wrapper = document.createElement('div')
  wrapper.className = 'hello'

  var title = document.createElement('h2')
  title.textContent = message
  wrapper.appendChild(title)

  var counter = document.createElement('p')
  counter.textContent = 'Count: ' + count
  wrapper.appendChild(counter)

  var button = document.createElement('button')
  button.textContent = 'Increment'
  button.addEventListener('click', function() {
    count++
    counter.textContent = 'Count: ' + count
  })
  wrapper.appendChild(button)

  container.appendChild(wrapper)

  setupUpdates({
    changeMessage: function(newMsg) {
      message = newMsg
      title.textContent = message
    },
    increment: function() {
      count++
      counter.textContent = 'Count: ' + count
    },
    getCount: function() {
      return count
    }
  })
}

function destroyApp() {
}

export default {
  start: Hello,
  destroy: destroyApp
}