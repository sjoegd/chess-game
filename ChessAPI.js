import {chessAnalysisApi, PROVIDERS} from 'chess-analysis-api';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io'

const app = express()
const server = createServer(app)
const io = new Server(server) 
const PORT = 3000;

app.use(express.static('./dist'))

server.listen(PORT, () => {
  console.log(`Started! Listening on port: ${PORT}`)
})

io.on("connection", (socket) => {
   console.log("Player connected: ", socket.id);
  // socket.on
  // socket.off
  // socket.emit
  giveAnalysisAccess(socket)
})

function giveAnalysisAccess(socket) {
    socket.on("analysis", (fen, depth) => {
        chessAnalysisApi.getAnalysis({
            fen,
            depth,
            multipv: 1,
            // excludes providers
            excludes: [
              PROVIDERS.LICHESS_BOOK,
              PROVIDERS.LICHESS_CLOUD_EVAL
            ]
        }).then(result => {
            socket.emit("result", result)
        })
    })

}
