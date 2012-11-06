var c = {};
c.king = 0;
c.queen = 1;
c.rook = 2;
c.bishop = 3;
c.knight = 4;
c.pawn = 5;

c.ir = function(i) { return Math.floor(Math.random()*i) }

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

// move pre-selected piece in response to mouse click

c.move = function (e) {
	//console.log(e);
	var p = c.ps[c.human].piece[c.toMove];
	var row = p.row;
	var col = p.col;	
	p.col = Math.floor(e.offsetX / c.size);
	p.row = Math.floor(e.offsetY / c.size);
	if (p.num == c.king && c.threatened(c.human, c.toMove)) {
		p.row = row;
		p.col = col;
		return;
	}
	c.drawBoard();
	c.drawAllPieces();
	c.board.off("click");
	c.board.on("click", c.pick);
	c.toMove = -1;
	console.log("MOVE");
	c.aiKing();
}

// assumes AI only has one piece (king)
c.aiKing = function() {
	var dr;	
	var dc;
	var sr = c.ps[c.ai].piece[0].row;
	var sc = c.ps[c.ai].piece[0].col;

	var moves = [];
	for (dr = -1; dr <= 1; dr++) {
		for (dc = -1; dc <= 1; dc++) {
			if (dr == 0 && dc == 0) continue; // must move
			var nr = sr + dr;
			var nc = sc + dc;
			if (nr >= c.n_rows || nr < 0
				 || nc >= c.n_cols || nc < 0)
				continue; // edge of board
			//alert("nr = " + nr + ", nc = " + nc);
			c.ps[c.ai].piece[0] = {
				 "num": c.king, "row": nr, "col": nc };
			//c.drawBoard();
			//c.drawAllPieces();
			if (! c.threatened(c.ai, 0)) {
				moves.push(c.ps[c.ai].piece[0]);
				//alert("Escape");
			} //else {
			//	alert("Check");
			//}
		}
	}
	if (moves.length == 0) {
		c.ps[c.ai].piece[0] = { "num": c.king, "row": sr, "col": sc };	
		if (c.threatened(c.ai, 0))
			alert("Checkmate!");
		else
			alert("Stalemate.");
		return;
	}
	c.ps[c.ai].piece[0] = moves[c.ir(moves.length)];
	c.drawBoard();
	c.drawAllPieces();	
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

	var max = 1000;
	do {
		c.ps = [{"piece":[]},{"piece":[]}];
		c.place(c.ai, c.king);
		c.place(c.human, c.king);
		c.place(c.human, c.queen);
	} while (c.threatened(c.ai, 0) && max--);
	if (max <= 0) { alert("Could not find position -- reload page"); }	

	c.p = {};
	c.p.sheet = new Image();
	c.p.sheet.src = 'sheet.png';
	c.p.widths = [33, 30, 30, 29, 29, 26];
	//c.p.sx = [57, 235];
	c.p.sx = [235, 57]; // x offsets
	c.p.sy = 0;
	c.p.height = 51;
}

// true if #piece is threatened by player
c.threatened = function(player, piece) {
	var other = 1 ^ player;
	var i;
	for (i=0; i < c.ps[other].piece.length; ++i) {
		//console.log(c);
		if (c.threat(other, i, piece)) {
			return true;
		}
	}
	return false;
}

// player's from piece threatens opponents to piece
c.threat = function(player, from_p, to_p) {
//	console.log(c);
	var piece_type = c.ps[player].piece[from_p].num;
	var fr = c.ps[player].piece[from_p].row;
	var fc = c.ps[player].piece[from_p].col;
	var other = 1 ^ player;
	var tr = c.ps[other].piece[to_p].row;
	var tc = c.ps[other].piece[to_p].col;
	
	var row;
	var col;
	switch(piece_type) {
		case c.king:
			for (row = -1; row <= 1; ++row) {
				for (col = -1; col <= 1; ++col) {
					// don't threaten self
					if (col == 0 && row == 0) continue;
					if (fr + row == tr
						&& fc + col == tc) {
							return true;
					}
				}
			}
						
			return false;
		case c.queen:
			for (row = -1; row <= 1; ++row) {
				for (col = -1; col <= 1; ++col) {
					if (col == 0 && row == 0) continue;
					for (m = 1; m <= c.n_rows ; ++m) {
						nr = fr + m*row;
						nc = fc + m*col; 
						// over edge of board
						if (nr < 0 || nr > c.n_rows
						 || nc < 0 || nc > c.n_cols)
							break;
						// blocking piece
						// FIXME only works with one other piece
						if (nr == c.ps[player].piece[0].row
							&& nc == c.ps[player].piece[0].col)
							break;
						if (nr == tr && nc == tc)
							return true;
					}
				}
			}

			return false;
		default:
			return false;
	}
}

// choose a random place for a piece of a given type
c.place = function(player, piece_type) {
	var placed = false;
	var row;
	var col;
	var pl;
	var i;
	while (!placed) {
		row = c.ir(c.n_rows);
		col = c.ir(c.n_cols);
		placed = true;
		// make sure another piece is not there
		for (pl=0; pl < 2; ++pl) {
			for (i=0; i < c.ps[pl].piece.length; ++i) {	
				if (c.ps[pl].piece[i].row == row
					&& c.ps[pl].piece[i].col == col) {
					placed = false;
				}
			}	
		}
	}
	var pi = c.ps[player].piece.length;
	c.ps[player].piece[pi] = {"num": piece_type, "row": row, "col": col}; 
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

// draw numbered piece
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

