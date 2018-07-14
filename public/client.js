let ws = {}

const canvas = document.querySelector('canvas')
let ctx = canvas.getContext('2d')

let width = window.innerWidth
let height = window.innerHeight
let clientX, clientY
let currX = 0, currY = 0, prevX = 0, prevY = 0
let flag = false, drawing = false, color, currColor

const brushWidth = 5

canvas.width = width
canvas.height = height

function connect() {
  try {
    ws.host = document.location.host
    ws.socket = {}

    ws.socket.connect = new window.WebSocket('wss://' + ws.host)
    ws.socket.connect.onerror = function () {
      console.log('could not connect to ', ws.host)
      ws.socket.connect.close()
    }

    ws.socket.connect.onopen = function () {
      if (ws.socket.connect.readyState === 1) {
        ws.socket.connect.send(JSON.stringify({
          type: 'pad.display',
          message: canvas.toDataURL('image/png')
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

    ws.socket.connect.onclose = function () {
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

function draw() {
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation = 'screen';
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(currX, currY);
  ctx.strokeStyle = color;
  ctx.lineWidth = brushWidth;
  ctx.stroke();
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
  ctx.stroke();
  ctx.shadowBlur = 12;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
  ctx.stroke();
  ctx.shadowBlur = 15;
  ctx.shadowColor = currColor;
  ctx.stroke();
  ctx.shadowBlur = 18;
  ctx.shadowColor = currColor;
  ctx.stroke();
  ctx.shadowBlur = 30;
  ctx.shadowColor = currColor;
  ctx.stroke();
  ctx.closePath();
}

function setDraw() {
  ctx = canvas.getContext('2d');

  function setMove(type, e) {
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    switch (type) {
      case 'down':
        prevX = currX;
        prevY = currY;
        currX = clientX;
        currY = clientY;

        flag = true;
        drawing = true;

        if (drawing) {
          ctx.beginPath();
          ctx.fillStyle = color;
          ctx.fillRect(currX, currY, 2, 2);
          ctx.closePath();
          drawing = false;
        }
        break;
      case 'up':
      case 'out':
        flag = false;
        break;
      case 'move':
        if (flag) {
          prevX = currX;
          prevY = currY;
          currX = clientX;
          currY = clientY;
          draw();
        }
        break;
    }
  }

  canvas.addEventListener('mouseup', (e) => {
    setMove('up', e);
  }, false);

  canvas.addEventListener('mousedown', (e) => {
    setMove('down', e);
  }, false);

  canvas.addEventListener('mouseout', (e) => {
    setMove('out', e);
  }, false);

  canvas.addEventListener('mousemove', (e) => {
    setMove('move', e);
  }, false);
}

setDraw()
