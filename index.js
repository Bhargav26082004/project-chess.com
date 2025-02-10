const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { Chess } = require('chess.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const chess = new Chess();
let player = {};
let currentplayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" });
});

io.on('connection', (socket) => {
    if (!player.white) {
        player.white = socket.id;
        socket.emit("playerrole", "w");
    } else if (!player.black) {
        player.black = socket.id;
        socket.emit("playerrole", "b");
    } else {
        socket.emit("spectatorrole");
    }

    socket.on("disconnect", () => {
        if (socket.id === player.white) delete player.white;
        if (socket.id === player.black) delete player.black;
    });

    socket.on("move", (move) => {
        try {
            if (chess.turn() === "w" && socket.id !== player.white) return;
            if (chess.turn() === "b" && socket.id !== player.black) return;
            const res = chess.move(move);
            if (res) {
                currentplayer = chess.turn();
                io.emit("move", move);
                io.emit("boardstate", chess.fen());
            } else {
                console.log(`Invalid Move: ${move}`);
                socket.emit("invalidMove", move);
            }
        } catch (e) {
            console.log(e);
            socket.emit("invalidMove", move);
        }
    });
});

server.listen(1220, () => {
    console.log('Server is running on port 5000');
});