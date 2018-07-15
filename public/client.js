let ws = {}

let id = document.location.pathname
let color = 'rgba(240, 30, 80, 0.8)'
let color2 = 'rgba(255, 255, 255, 0.01)'

const colorBtns = document.querySelectorAll('#colors button')

colorBtns.forEach(c => {
  if (color === c.getAttribute('data-color')) {
    c.classList.add('on') 
  }
  c.onclick = function () {
    clearAll()
    color = c.getAttribute('data-color') 
    c.classList.add('on')
  }
})

function clearAll() {
  colorBtns.forEach(c => c.classList.remove('on')) 
}

if (id === '/') {
  let btn = document.createElement('button')
  btn.textContent = 'create a new board'
  btn.onclick = function () {
    const pow = Math.pow(36, 10)
    const newId = Math.round(pow - Math.random() * pow).toString(36).slice(1).replace('/', '')
    window.open(`/${newId}`, '_blank')
  }
  document.body.appendChild(btn)
} else {
  const canvas = document.querySelector('canvas')
  let ctx = canvas.getContext('2d')
  
  ctx.translate(0.5, 0.5)

  let width = window.innerWidth
  let height = window.innerHeight
  let clientX, clientY
  let currX = 0, currY = 0, prevX = 0, prevY = 0
  let flag = false, drawing = false, currColor
  const brushWidth = 2

  canvas.width = width
  canvas.height = height

  function connect() {
    ws.host = document.location.host
    ws.socket = {}

    if (!ws.socket[id]) {
      ws.socket[id] = {} 
    }

    ws.socket[id].connect = new window.WebSocket(`wss://${ws.host}${id}`)
    ws.socket[id].connect.onerror = function () {
      console.log('could not connect to ', ws.host)
      ws.socket[id].connect.close()
    }

    ws.socket[id].connect.onmessage = function (data) {
      display(JSON.parse(data.data).message)
    }

    ws.socket[id].connect.onopen = function () {      
      if (ws.socket[id].connect.readyState !== 1) {
        setTimeout(() => {
          console.log('reconnecting')
          connect()
        }, 1500)
      }
    }

    ws.socket[id].connect.onclose = function () {
      console.log('reconnecting')
      setTimeout(() => {
        connect()
      }, 1500)
    }
  }

  function display(data) {
    let img = new Image
    img.onload = function () {
       ctx.drawImage(img, 0, 0) 
    }
    img.src = data
  }

  function draw() {
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'overlay'

    ctx.moveTo(prevX, prevY)
    ctx.lineTo(currX, currY)
    ctx.strokeStyle = color
    ctx.lineWidth = brushWidth
    ctx.stroke()
    ctx.strokeStyle = color2
    ctx.lineWidth = brushWidth + 5
    ctx.shadowBlur = 15
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.01)'
    ctx.lineWidth = brushWidth + 6
    ctx.shadowBlur = 15
    ctx.stroke()

  }

  function updateDisplay() {
    ws.socket[id].connect.send(JSON.stringify({
      type: 'pad.update',
      message: canvas.toDataURL('image/png'),
      id: id
    }))
  }

  function setDraw() {
    ctx = canvas.getContext('2d')

    function setMove(type, e) {
      if (e.touches) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      switch (type) {
        case 'down':
          prevX = currX
          prevY = currY
          currX = clientX
          currY = clientY

          flag = true
          drawing = true

          if (drawing) {
            ctx.beginPath()
            ctx.fillStyle = color
            ctx.fillRect(currX, currY, 2, 2)
            ctx.closePath()
            drawing = false
          }
          break
        case 'up':
          flag = false
          updateDisplay()
        case 'out':
          flag = false
          break
        case 'move':
          if (flag) {
            prevX = currX
            prevY = currY
            currX = clientX
            currY = clientY
            draw()
          }
          break
      }
    }

    canvas.addEventListener('mouseup', (e) => {
      setMove('up', e)
      updateDisplay()
    }, false)

    canvas.addEventListener('mousedown', (e) => {
      setMove('down', e)
    }, false)

    canvas.addEventListener('mouseout', (e) => {
      setMove('out', e)
    }, false)

    canvas.addEventListener('mousemove', (e) => {
      setMove('move', e)
    }, false)
  }

  connect()
  setDraw()
}
