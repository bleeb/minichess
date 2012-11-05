var c = {};

function ir(i) { return Math.floor(Math.random()*i) }

window.onload = function () {
	c.init();
	c.drawBoard(c.white_on_right);

	c.board.on("click", c.move);

	setTimeout(function () {
		c.drawAllPieces();
	}, 100);
}

c.move = function (e) {
	//console.log(e);
	c.ps[0].piece[0].row = Math.floor(e.offsetY / c.size);
	c.ps[0].piece[0].col = Math.floor(e.offsetX / c.size);
	c.drawBoard();
	c.drawAllPieces();
}

c.drawAllPieces = function () {
	for (pl=0; pl < 2; pl++) {
		for (pi=0; pi < c.ps[pl].piece.length; pi++) {
			c.drawPiece(pl, pi);
		}
	}
}

c.init = function () {
	c.board = $('#board');
	c.ctx = c.board[0].getContext('2d');
	c.n_rows = 4;
	c.n_cols = 4;
	c.board_size = 480;
	c.size = c.board_size / c.n_rows;
	c.white_on_right = 1;

	c.set = 9;

	c.ps = [{}, {}];
	c.ps[0].piece = [{"num": 0, "row": ir(c.n_rows), "col": ir(c.n_cols)}];
	c.ps[1].piece = [{"num": 1, "row": ir(c.n_rows), "col": ir(c.n_cols)}];

	c.p = {};
	c.p.sheet = new Image();
	c.p.sheet.src = 'sheet.png';
	c.p.widths = [33, 30, 30, 29, 29, 26];
	//c.p.sx = [57, 235];
	c.p.sx = [235, 57]; // x offsets
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

c.drawPiece = function(player, piece) {
//	console.log(file + " " + rank);
	srcX = c.p.sx[player];
	for (i = 0; i < c.ps[player].piece[piece].num; ++i) {
		srcX += c.p.widths[i];
	}	
	srcW = c.p.widths[c.ps[player].piece[piece].num];
	srcY = c.p.sy + c.set * c.p.height;
	srcH = c.p.height;
	destX = c.ps[player].piece[piece].col * c.size;
	destY = c.ps[player].piece[piece].row * c.size;
	destW = c.size;
	destH = c.size;	 
	c.ctx.drawImage(c.p.sheet,srcX,srcY,srcW,srcH,destX,destY,destW,destH);
}

