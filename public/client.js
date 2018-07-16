let ws = {}

let id = document.location.pathname
let color = 'rgba(240, 30, 80, 0.8)'

let newBtn = document.querySelector('#new-btn')
const colors = document.querySelector('#colors')
const colorBtns = colors.querySelectorAll('button')
const gridBtn = document.querySelector('#grid')

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

let btn = document.createElement('button')
btn.id = 'new-btn'
btn.textContent = 'create a new board'
btn.onclick = function () {
  const pow = Math.pow(36, 10)
  const newId = Math.round(pow - Math.random() * pow).toString(36).slice(1).replace('/', '')
  window.open(`/${newId}`, '_blank')
}
document.body.appendChild(btn)

if (id !== '/') {
  colors.classList.remove('hide')
  btn.classList.add('hide')
  const canvas = document.querySelector('#sketch-panel')
 
  let ctx = canvas.getContext('2d')

  ctx.translate(0.5, 0.5)
  ctx.lineCap = 'round'
  ctx.globalCompositeOperation = 'screen'
  
  const brushWidth = 3

  let width = window.innerWidth
  let height = window.innerHeight
  let clientX, clientY
  let currX = 0, currY = 0, prevX = 0, prevY = 0
  let flag = false, drawing = false, currColor
  let gridColor = 'rgba(40, 150, 220, 0.7)'

  canvas.width = width
  canvas.height = height

  function displayGrid() {
    const bw = canvas.width
    const bh = canvas.height
    const p = 0
    
    ctx.lineWidth = 1
    
    for (let x = 0; x <= bw; x += 40) {
      ctx.moveTo(0.5 + x + p, p)
      ctx.lineTo(0.5 + x + p, bh + p)
    }

    for (let x = 0; x <= bh; x += 40) {
      ctx.moveTo(p, 0.5 + x + p)
      ctx.lineTo(bw + p, 0.5 + x + p)
    }

    ctx.strokeStyle = gridColor
    ctx.stroke()
    
    ctx.lineWidth = brushWidth
  }

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
      ws.socket[id].connect.send(JSON.stringify({
        type: 'pad.connect',
        id: id
      }))
      
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
    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(currX, currY)
    ctx.strokeStyle = color
    ctx.lineWidth = brushWidth
    ctx.stroke()
    ctx.shadowBlur = 16
    ctx.shadowColor = 'rgba(255, 255, 255, 0.85)'
    ctx.stroke()
    ctx.shadowBlur = 10
    ctx.shadowColor = color
    ctx.stroke()
    ctx.shadowBlur = 20
    ctx.shadowColor = color
    ctx.stroke()
    ctx.closePath()
  }

  function updateDisplay() {
    ws.socket[id].connect.send(JSON.stringify({
      type: 'pad.update',
      message: canvas.toDataURL('image/jpeg'),
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
            ctx.fillRect(currX, currY, 3, 3)
            ctx.closePath()
            drawing = false
          }
          break
        case 'up':
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

    canvas.addEventListener('touchstart', (e) => {
      setMove('down', e)
    }, false)
    canvas.addEventListener('touchend', (e) => {
      setMove('up', e)
      updateDisplay()
    }, false)
    canvas.addEventListener('touchcancel', (e) => {
      setMove('out', e)
    }, false)
    canvas.addEventListener('touchmove', (e) => {
      setMove('move', e)
    }, false)
  }

  connect()
  setDraw()
  displayGrid()
}
