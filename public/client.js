let ws = {}

const canvas = document.querySelector('canvas')

function connect() {
  try {
    const host = document.location.host
    const protocol = document.location.protocol

    ws[host] = new window.WebSocket('ws' + (protocol === ('https:' || 'wss:') ? 's' : '') + '://' + host)
    ws[host].onerror = function () {
      console.log('could not connect to ', host)
      ws[host].close()
    }

    ws[host[1]].onopen = function () {
      if (ws[host].readyState === 1) {
        ws[host].send(JSON.stringify({
          type: 'pad.display'
        }))

        ws[host[1]].onmessage = function (data) {
          data = JSON.parse(data.data)
          display(data)
        }
      } else {
        setTimeout(() => {
          connect()
        }, 1500)
      }
    }

    ws[host[1]].onclose = function () {
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
  console.log('displaying', data)
}