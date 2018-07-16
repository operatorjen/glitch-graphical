let ws = {}

let id = document.location.pathname
let color = 'rgb(240, 30, 80)'

let newBtn = document.querySelector('#new-btn')
const colors = document.querySelector('#colors')
const colorBtns = colors.querySelectorAll('button')
const gridBtn = document.querySelector('#grid')
const note = document.querySelector('#note')

let lastPath = []

colorBtns.forEach(c => {
  if (color === c.getAttribute('data-color')) {
    c.classList.add('on') 
  }
  c.onclick = function () {
    colorBtns.forEach(c => c.classList.remove('on')) 
    color = c.getAttribute('data-color') 
    c.classList.add('on')
  }
})

let btn = document.createElement('button')
btn.id = 'new-btn'
btn.textContent = 'create a new board'
btn.onclick = function () {
  const pow = Math.pow(36, 10)
  const newId = Math.round(pow - Math.random() * pow).toString(36).slice(1).replace('/', '')
  window.open(`/${newId}`, '_blank')
}
document.body.appendChild(btn)

if (id === '/') {
  note.classList.remove('hide')
} else {
  colors.classList.remove('hide')
  btn.classList.add('hide')

  const canvas = document.querySelector('#sketch-panel')
  const brushWidth = 2
 
  let ctx = canvas.getContext('2d')

  ctx.translate(0.5, 0.5)
  ctx.lineCap = 'round'

  let width = window.innerWidth
  let height = window.innerHeight
  let clientX, clientY
  let currX = 0, currY = 0, prevX = 0, prevY = 0
  let flag = false, drawing = false, currColor

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
      lastPath = JSON.parse(data.data).message || []
      display(lastPath)
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

  function display(data, local = false) {
    if (data && data.length) {
      data.map(d => {
        prevX = d.prevX
        prevY = d.prevY
        currX = d.currX
        currY = d.currY
        color = d.color
        draw(local)
      })
    }
  }

  function draw(local = false) {
    ctx.beginPath()
    ctx.globalCompositeOperation = 'source-over'
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(currX, currY)
    ctx.strokeStyle = color
    ctx.lineWidth = brushWidth
    ctx.stroke()
    ctx.shadowBlur = 4
    ctx.shadowColor = 'rgba(255, 255, 255, 0.75)'
    ctx.stroke()
    ctx.shadowBlur = 3
    ctx.shadowColor = color
    ctx.stroke()
    ctx.shadowBlur = 5
    ctx.shadowColor = color
    ctx.stroke()
    ctx.closePath()

    if (local) {
      lastPath.push({
        prevX,
        prevY,
        currX,
        currY,
        color
      })
    }
  }
  
  function erase() {
    ctx.beginPath()
    ctx.globalCompositeOperation = 'copy'
    ctx.lineTo(prevX, prevY)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0)'
    ctx.lineWidth = brushWidth + 5
    ctx.stroke()
    ctx.lineTo(currX, currY)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0)'
    ctx.lineWidth = brushWidth + 5
    ctx.stroke()
    ctx.closePath()
  }

  function updateDisplay() {
    ws.socket[id].connect.send(JSON.stringify({
      type: 'pad.update',
      message: lastPath,
      id: id
    }))
  }

  function setDraw() {
    function setMove(type, e) {
      console.log(e)
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
            draw(true)
          }
          break
      }
    }

    canvas.addEventListener('mouseup', (ev) => {
      ev.preventDefault()
      setMove('up', ev)
      updateDisplay()
    }, false)
    canvas.addEventListener('mousedown', (ev) => {
      ev.preventDefault()
      setMove('down', ev)
    }, false)
    canvas.addEventListener('mouseout', (ev) => {
      ev.preventDefault()
      setMove('out', ev)
    }, false)
    canvas.addEventListener('mousemove', (ev) => {
      ev.preventDefault()
      setMove('move', ev)
    }, false)
    canvas.addEventListener('touchstart', (ev) => {
      ev.preventDefault()
      setMove('down', ev)
      updateDisplay()
    }, false)
    canvas.addEventListener('touchend', (ev) => {
      ev.preventDefault()
      setMove('up', ev)
    }, false)
    canvas.addEventListener('touchcancel', (ev) => {
      ev.preventDefault()
      setMove('out', ev)
    }, false)
    canvas.addEventListener('touchmove', (ev) => {
      ev.preventDefault()
      setMove('move', ev)
    }, false)
  }
  
  ctx = canvas.getContext('2d')

  connect()
  setDraw()

  function keypress(e) {
    const evt = window.event ? event : e
    
    if (evt.keyCode === 90 && (evt.ctrlKey || evt.metaKey)) {
      // undo
      for (let i = 0; i < 10; i++) {
        if (lastPath.length) {
          lastPath.pop()
        }
      }
      erase()
      updateDisplay()
    }
  }

  document.onkeydown = keypress
}