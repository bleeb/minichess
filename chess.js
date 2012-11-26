var c = {};

c.init = function () {
	// dom elements
	c.board = $('#board');
	c.ctx = c.board[0].getContext('2d');

	// static parameters
	c.n_rows = 4;
	c.n_cols = 4;
	c.board_size = 480;
	c.size = c.board_size / c.n_rows;
	c.white_on_right = 1;
	c.human = 0;
	c.ai = 1;
	c.set = 9;
	c.toMove = -1;

	// set up pieces
	var max = 1000;
	do {
		c.ps = [{"piece":[]},{"piece":[]}];
		c.place(c.ai, c.king);
		c.place(c.human, c.king);
		c.place(c.human, c.queen);
	} while (c.threatened(c.ai, 0) && max--);
	if (max <= 0) { $('#status').append("Could not find position -- reload page"); }	

	// spritesheet
	c.p = {};
	c.p.sheet = new Image();
	c.p.sheet.src = 'http://img689.imageshack.us/img689/2497/sheetqx.png';
	c.p.widths = [33, 30, 30, 29, 29, 26];
	c.p.sx = [235, 57]; // x offsets
	c.p.sy = 0;
	c.p.height = 51;
	c.p.sheet.onload = c.drawAllPieces;
}

window.onload = function () {
	c.init();
	c.drawBoard();
	//c.drawLabels();
	c.board.on("click", c.pick);

	$(document)[0].oncontextmenu = function() {return false;} 
	c.board.on("mousedown", function (e) {
		if (e.button == 2) {
			c.toggleField(Math.floor(e.offsetY/c.size),
					Math.floor(e.offsetX/c.size));
		}
	});
//	setTimeout(function () {
//		c.drawAllPieces();
//	}, 5000); // wait for spritesheet to load
}

// enumerated constants
c.king = 0;
c.queen = 1;
c.rook = 2;
c.bishop = 3;
c.knight = 4;
c.pawn = 5;

// toggle whether to show force field around piece
c.toggleField = function(row, col) {
	var pl;
	var pi;
	var p = false;
	findpiece:
	for (pl=0; pl < 2; ++pl) {
		for (pi=0; pi < c.ps[pl].piece.length; ++pi) {
			var t = c.ps[pl].piece[pi];
			if (t.row == row && t.col == col) {
				p = t;
				break findpiece;
			}		
		}
	}
	if (!p) { return; }
	p.field = !p.field;

	c.drawBoard();
	c.drawAllPieces();
}

// random int < i
c.ir = function(i) { return Math.floor(Math.random()*i) }

// select a piece to be moved
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

// unselect piece selected for move
c.unselect = function () {
		c.toMove = -1;
		c.drawBoard();
		c.drawAllPieces();
		c.board.off("click");
		c.board.on("click", c.pick);
}

// move pre-selected piece in response to mouse click
c.move = function (e) {
	//console.log(e);
	var p = c.ps[c.human].piece[c.toMove];
	var col = Math.floor(e.offsetX / c.size);
	var row = Math.floor(e.offsetY / c.size);
	
	if ((row == p.row && col == p.col)
	|| ! c.canMove(p.num, c.human, p.row, p.col, row, col, true)) {
		c.unselect();
		return;
	}
	var save_row = p.row;
	var save_col = p.col;
	p.row = row;
	p.col = col;

	if (p.num == c.king && c.threatened(c.human, c.toMove)) {
		p.row = save_row;
		p.col = save_col;
		c.unselect();
		return;
	}
	c.unselect();
	var codes = new Array("K", "Q");
	var cols = new Array("a", "b", "c", "d");
	$('#status ol').append(
		$('<li>').append(
			codes[p.num] + cols[save_col] + (4-save_row) + "-" + cols[p.col] + (4-p.row)));
	c.aiKing();
}

// move AI player's king - assume AI has only one piece
c.aiKing = function() {
	var dr;	
	var dc;
	var king = c.ps[c.ai].piece[0];
	var sr = king.row;
	var sc = king.col;

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
			king.row = nr;
			king.col = nc;
			//c.drawBoard();
			//c.drawAllPieces();
			if (! c.threatened(c.ai, 0)) {
				moves.push({"r":nr,"c":nc});
				//alert("Escape");
			} //else {
			//	alert("Check");
			//}
		}
	}
	if (moves.length == 0) {
		king.row = sr;
		king.col = sc;	
		if (c.threatened(c.ai, 0)) {
			$('#status ol li:last').append('#');
			$('#status').append("Checkmate!");
		} else {
			$('#status ol li:last').append('?');
			$('#status').append("Stalemate.");
		}
		return;
	}
	var m = c.ir(moves.length);
	var codes = new Array("K", "Q");
	var cols = new Array("a", "b", "c", "d");
	var move_str = ' ' + codes[0] + cols[sc] + (4-sr)
				+ "-" + cols[moves[m].c] + (4-moves[m].r);
	king.row = moves[m].r;
	king.col = moves[m].c;
	var captured_queen = false;
	if (c.ps[c.human].piece[1].row == king.row
		&& c.ps[c.human].piece[1].col == king.col) {
		c.ps[c.human].piece[1] = {};
		$('#status ol li:last').append('?');
		$('#status').append("Stalemate (queen captured).");
	}
	c.drawBoard();
	c.drawAllPieces();
	$('#status ol li:last').append(move_str);
}

// draw all of each player's pieces
c.drawAllPieces = function () {
	var pl;
	var pi;
	for (pl=0; pl < 2; pl++) {
		for (pi=0; pi < c.ps[pl].piece.length; pi++) {
			c.drawPiece(pl, pi);
		}
	}
}

// bool: player's #piece can be captured by opponent
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

// bool: player's from piece can capture opponents to piece
c.threat = function(player, from_p, to_p) {
//	console.log(c);
	var piece_type = c.ps[player].piece[from_p].num;
	var fr = c.ps[player].piece[from_p].row;
	var fc = c.ps[player].piece[from_p].col;
	var other = 1 ^ player;
	var tr = c.ps[other].piece[to_p].row;
	var tc = c.ps[other].piece[to_p].col;
	return c.canMove(piece_type, player, fr, fc, tr, tc, false);
}

// bool: can player move a piece_type from fr,fc to tr,tc

// avoid_own_piece(bool): do not consider a piece can move onto a piece of the same color
// true when we are highlighting which squares we can move to
// false when planning moves ahead (if piece at tr,tc is lost, fr,fc defends)
c.canMove = function(piece_type, player, fr, fc, tr, tc, avoid_own_piece) {
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
							// don't move onto queen
							var p = c.ps[player].piece[1];
							if (avoid_own_piece && p && p.col == tc && p.row == tr) {
								return false;
							}
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
	c.ps[player].piece[pi] = {"num": piece_type, "row": row, "col": col,
				"field": false}; 
}

// erase and redraw empty board
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

c.drawLabels = function () {
	c.ctx.fillStyle = "rgb(0,255,0)";
	c.ctx.font = String(c.size/2)+"px sans-serif"; 
	c.ctx.textBaseline = "top";
	var start = "a".charCodeAt(0);
	var num = "1".charCodeAt(0);
	var i;
	for (i = 0; i < c.n_rows; ++i) {
		c.ctx.fillText(String.fromCharCode(start+i), (.4+i)*c.size, c.board_size);
		c.ctx.fillText(String.fromCharCode(num+i), c.board_size+c.size/6, (c.n_rows-.8-i)*c.size);
	}
}

// draw a numbered piece
c.drawPiece = function(player, piece) {
//	console.log(file + " " + rank);
	var srcX = c.p.sx[player];
	var p = c.ps[player].piece[piece];
	var i;
	for (i = 0; i < p.num; ++i) {
		srcX += c.p.widths[i];
	}	
	var srcW = c.p.widths[p.num];
	var srcY = c.p.sy + c.set * c.p.height;
	var srcH = c.p.height;
	var destX = p.col * c.size;
	var destY = p.row * c.size;
	destW = c.size * c.p.widths[piece] / c.p.height;
	destX += (c.size - destW) / 2;
	destH = c.size;	 
	c.ctx.drawImage(c.p.sheet,srcX,srcY,srcW,srcH,destX,destY,destW,destH);
	if (! p.field) { return; }

	var row;
	var col;
	for (row = 0; row < c.n_rows; ++row) {
		for (col = 0; col < c.n_cols; ++col) {
			if (c.canMove(p.num, player, p.row, p.col, row, col, true)) {

      				var grd = c.ctx.createRadialGradient((col+.5)*c.size, (row+.5)*c.size,
						 0, (col+.5)*(c.size), (row+.5)*(c.size), c.size/2);
      				// light blue
      				grd.addColorStop((row+col+c.white_on_right)%2, '#ffffff');   
      				// dark blue
      				grd.addColorStop((row+col+!c.white_on_right)%2, '#00ff00');
      				c.ctx.fillStyle = grd;
				c.ctx.fillRect(col*c.size, row*c.size, c.size, c.size, 0.1); 
				console.log(p.num + " " + player + " " + row + " " + col);
			}
		}
	}
}

