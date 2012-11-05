var c = {};

function ir(i) { return Math.floor(Math.random()*i) }

window.onload = function () {
	c.init();
	c.drawBoard();

	c.board.on("click", c.pick);

	setTimeout(function () {
		c.drawAllPieces();
	}, 500);
}

c.pick = function (e) {
	console.log("PICK");
	var row = Math.floor(e.offsetY / c.size);
	var col = Math.floor(e.offsetX / c.size);
	var i;

	for (i = 0; i < c.ps[c.human].piece.length; ++i) {
		if (row == c.ps[c.human].piece[i].row
			&& col == c.ps[c.human].piece[i].col) {
				c.ctx.fillStyle = "rgb(255,0,0)";
				c.ctx.fillRect(col*c.size, row*c.size, c.size, c.size);
				c.drawPiece(c.human, i);
				c.board.off("click");
				c.board.on("click", c.move);
				c.toMove = i;
				return;
		}
	}
}

c.move = function (e) {
	//console.log(e);
	c.ps[c.human].piece[c.toMove].col = Math.floor(e.offsetX / c.size);
	c.ps[c.human].piece[c.toMove].row = Math.floor(e.offsetY / c.size);
	c.drawBoard();
	c.drawAllPieces();
	c.board.off("click");
	c.board.on("click", c.pick);
	c.toMove = -1;
	console.log("MOVE");
}

c.drawAllPieces = function () {
	var pl;
	var pi;
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
	c.human = 0;
	c.ai = 1;
	c.set = 9;
	c.toMove = -1;

	c.ps = [{}, {}];
	c.ps[c.human].piece = [];
	c.ps[c.ai].piece = [];

	c.place(c.human, 0);
	c.place(c.human, 1);
	c.place(c.ai, 0);

	c.p = {};
	c.p.sheet = new Image();
	c.p.sheet.src = 'sheet.png';
	c.p.widths = [33, 30, 30, 29, 29, 26];
	//c.p.sx = [57, 235];
	c.p.sx = [235, 57]; // x offsets
	c.p.sy = 0;
	c.p.height = 51;
}

c.place = function(player, piece) {
	var placed = 0;
	var row;
	var col;
	var pl;
	var i;
	while (!placed) {
		row = ir(c.n_rows);
		col = ir(c.n_cols);
		placed = 1;
		for (pl=0; pl < 2; ++pl) {
			for (i=0; i < c.ps[pl].piece.length; ++i) {	
				if (c.ps[pl].piece[i].row == row
					&& c.ps[pl].piece[i].col == col) {
					placed = 0;
				}
			}	
		}
	}
	var pi = c.ps[player].piece.length;
	c.ps[player].piece[pi] = {"num": piece, "row": row, "col": col}; 
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

