const WebSocketServer = require('ws').Server
const http = require('http')
const path = require('path')
const express = require('express')
const ws = require('ws')

const app = express()
app.use(express.static(path.join(__dirname, '/public')))

const server = http.createServer(app)

server.listen(process.env.PORT || 8080)

const wss = new WebSocketServer({
  server: server
})

function broadcast (data, ws, sendToAll) {
  wss.clients.forEach(function each (client) {
    try {
      if (client && client.send) {
        if (sendToAll) {
          client.send(JSON.stringify(data))
        } else if (client === ws) {
          client.send(JSON.stringify(data))
        }
      }
    } catch (e) {

    }
  })
}

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    data = JSON.parse(data)
    
    switch (data.type) {
      case 'update':
        console.log('updating')
        break
      case 'display':
        console.log('displaying')
        break
      default:
        break
    }
  })
})

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});