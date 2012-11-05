var c = {};

function ir(i) { return Math.floor(Math.random()*i) }

window.onload = function () {
	c.init();
	c.drawBoard(c.white_on_right);

	c.board.on("click", c.move);

	setTimeout(function () {
	c.drawPiece(ir(6), ir(4), ir(4), ir(2), ir(10));
	}, 100);
}

c.move = function (e) {
	//console.log(e);
	row = Math.floor(e.offsetY / c.size);
	col = Math.floor(e.offsetX / c.size);
	c.drawBoard();
	c.drawPiece(ir(6), col, row, ir(2), ir(10));
}

c.init = function () {
	c.board = $('#board');
	c.ctx = c.board[0].getContext('2d');
	c.n_rows = 4;
	c.n_cols = 4;
	c.board_size = 480;
	c.size = c.board_size / c.n_rows;
	c.white_on_right = 1;

	c.p = {};
	c.p.sheet = new Image();
	c.p.sheet.src = 'sheet.png';
	c.p.sx = [57, 235];
	c.p.widths = [33, 30, 30, 29, 29, 26];
	c.p.sy = 0;
	c.p.height = 51;
}

c.drawBoard = function () {
	var row;
	var col;

	c.ctx.clearRect (0, 0, c.board_size, c.board_size);

	c.ctx.fillStyle = "rgb(0,255,0)";
	for (row = 0; row < c.n_rows; ++row) {
		for (col = 0; col < c.n_cols; ++col) {
			if ((row+col)%2 == c.white_on_right) {
				c.ctx.fillRect(row*c.size, col*c.size, c.size, c.size);
			}
		}
	}
}

c.drawPiece = function(piece, file, rank, player, set) {
	console.log(piece + " " + file + " " + rank + " " + player + " " + set);
	srcX = c.p.sx[player];
	for (i = 0; i < piece; ++i) {
		srcX += c.p.widths[i];
	}	
	srcW = c.p.widths[piece];
	srcY = c.p.sy + set * c.p.height;
	srcH = c.p.height;
	destX = file * c.size;
	destY = rank * c.size;
	destW = c.size;
	destH = c.size;	 
	c.ctx.drawImage(c.p.sheet,srcX,srcY,srcW,srcH,destX,destY,destW,destH);
}

