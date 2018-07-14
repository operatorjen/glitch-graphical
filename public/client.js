let ws = {}

const canvas = document.querySelector('canvas')

function connect () {
  try {
    const host = document.location.split('://')
    const protocol = host[0]

    ws[host[1]] = new window.WebSocket('ws' + (protocol === ('https' || 'wss') ? 's' : '') + '://' + host[1])
    ws[host[1]].onerror = function () {
      console.log('could not connect to ', host[1])
      ws[host[1]].close()
    }

    ws[host[1]].onopen = function () {
      if (ws[host[1]].readyState === 1) {
        ws[host[1]].send(JSON.stringify({
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

function display(data) {
  
}