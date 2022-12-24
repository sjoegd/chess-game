import io from "socket.io-client";

const socket = io()

export function getAnalysis(fen, depth) {
    return new Promise((resolve, reject) => {
        socket.emit("analysis",  fen, depth)
        socket.once("result", (result) => resolve(result))

        setTimeout(() => reject("timeout"), 10000)
    })
}

export function getCustomEngineMove(fen, depth, color) {
    return new Promise((resolve, reject) => {
        socket.emit("custom_move", fen, depth, color)
        socket.once("custom_result", (result) => resolve(result))
    })
}







