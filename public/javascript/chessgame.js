const socket = io();
const chess = new Chess();
const boardelement = document.querySelector(".chessboard");

let draggedpiece = null;
//  the piece being dragged during drag and drop action

let sourceSquare = null;
//  stores the starting squares of dragged piece 
let playerrole = null;

const renderBoard = () => {
    const board = chess.board();

    boardelement.innerHTML = "";
    board.forEach((row, rowidx) => {
        row.forEach((square, squareidx) => {
            //  aa loop thi particular square mali jase kem ke a matrix ma 6e 
            const squareElement = document.createElement("div");
            //  particular square div banse 
            squareElement.classList.add(
                "square",
                (rowidx + squareidx) % 2 === 0 ? "light" : "dark"
                //  main formula 6e jena thi chess board banse 
                //  this is done for pattern
            );
            squareElement.dataset.row = rowidx;
            squareElement.dataset.col = squareidx;

            if (square) {
                //  matlab jo square ma value 6e etle ke e piece null nahi
                const pieceele = document.createElement("div");
                pieceele.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );
                pieceele.innerText = getPieceUniCode(square.type, square.color);
                pieceele.draggable = playerrole === square.color;

                pieceele.addEventListener("dragstart", (e) => {
                    if (pieceele.draggable) {
                        draggedpiece = pieceele;
                        sourceSquare = { row: rowidx, col: squareidx };
                        e.dataTransfer.setData("text/plain", "");
                        //  kaya square thi move thyu e khabr padse 

                        //  drag feature ma eror thi bachavae badha browser ma chale 
                    }
                });

                //  drag thai jai pachi clear krva variable mathi 
                pieceele.addEventListener("dragend", (e) => {
                    draggedpiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceele);
                //  particular square pr particular piece aavi jase 
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
                //  drag kre to kasu ni thai 
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedpiece) {
                    const targetSource = {
                        //  navi position pr dragged thai 
                        row: parseInt(squareElement.dataset.row),
                        //  aa number return kre je aapre loop ma chalvi e e e 
                        col: parseInt(squareElement.dataset.col),
                    };
                    handleMove(sourceSquare, targetSource);
                }
            });

            boardelement.appendChild(squareElement);
        });
    });
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: q,

    };
    if (playerrole === 'b') {
        boardelement.classList.add("flipped");

    } else {
        boardelement.classList.remove("flipped");
    }

    if (chess.move(move)) {
        renderBoard();
        socket.emit("move", move);
    } else {
        console.log("Invalid move");
    }
};

const getPieceUniCode = (type, color) => {
    const pieces = {
        p: { w: "♙", b: "♙" },
        r: { w: "♖", b: "♜" },
        n: { w: "♘", b: "♞" },
        b: { w: "♗", b: "♝" },
        q: { w: "♕", b: "♛" },
        k: { w: "♔", b: "♚" },
    };
    return pieces[type][color];
};
// special pieces aama store thai sakal aave 

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

socket.on("boardstate", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("playerrole", (role) => {
    playerrole = role;
    renderBoard();
});
socket.on("spectatorrole", () => {
    playerole = null;
    renderBoard();

})
renderBoard();