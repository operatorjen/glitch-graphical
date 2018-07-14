let ws = {}

const canvas = document.querySelector('canvas')

function connect() {
  try {
    ws.host = document.location.host
    ws.protocol = document.location.protocol
    ws.socket = {}

    ws.socket.connect = new window.WebSocket('ws' + (protocol === ('https:' || 'wss:') ? 's' : '') + '://' + host)
    ws.socket.connect.onerror = function () {
      console.log('could not connect to ', host)
      ws.socket.connect.close()
    }

    ws.socket.connect.onopen = function () {
      if (ws.socket.connect.readyState === 1) {
        ws.socket.connect.send(JSON.stringify({
          type: 'pad.display'
        }))

        ws.socket.connect.onmessage = function (data) {
          data = JSON.parse(data.data)
          display(data)
        }
      } else {
        setTimeout(() => {
          connect()
        }, 1500)
      }
    }

    ws.socket.onclose = function () {
      console.log('reconnecting')
      setTimeout(() => {
        connect()
      }, 1500)
    }
  } catch (err) {
    console.log(err)
  }
}

connect()

function display(data) {
  console.log('displaying', data, ws)
}