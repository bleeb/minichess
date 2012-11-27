var c = {};
c.p = {};

c.init = function () {
	// dom elements
	c.board = $('#board');
	c.ctx = c.board[0].getContext('2d');

	// static parameters
	c.n_rows = $('[type=radio]:checked').val();
	c.n_cols = c.n_rows;
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
	
	c.drawBoard();
	$('#status').empty();
	$('ol').empty();
	$("#info").empty();
}

window.onload = function () {
	$('#start').on("click", function (e) { c.init(); });

	c.init();
	//c.drawLabels();
	c.board.on("click", c.pick);

	$(document)[0].oncontextmenu = function() {return false;} 
	c.board.on("mousedown", function (e) {
		if (e.button == 2) {
			c.toggleField(c.row(e), c.col(e));
		}
	});

	$("#tutorial").on("click", function (e) {
		$("#info").empty();
		$("#info").append("<br>")
			.append("To win you must place black in <b>checkmate</b> while avoiding <b>stalemate</b>")
			.append($("<ul>")
				.append($("<li>")
					.append("To be in checkmate, black must be in <b>check</b>, and have no legal moves"))
				.append($("<li>")
					.append("Black is in check when the white queen can move into the black king's square"))
				.append($("<li>")
					.append("Neither king can legally move into a square controlled by a piece of the other color"))
				.append($("<li>")
					.append("If black has no legal moves but is not in check, the game ends in stalemate"))
	)});

	$("#help").on("click", function (e) {
		$("#info").empty();
		$("#info").append("<br>")
			.append("Play the white pieces to checkmate black.")
			.append($("<ul>")
				.append($("<li>")
					.append("Click a white piece to select"))
				.append($("<li>")
					.append("Click another square to move the selected piece"))
				.append($("<li>")
					.append("Right-click a piece to preview its legal moves"))
				.append($("<li>")
					.append("Right-click again to remove preview"))
				.append($("<li>")
					.append("Choose board size and click <b>start</b> for new game"))
	)});

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

// col & row helper functions: Firefox does not implement offsetX/offsetY
c.col = function (e) {
	if (typeof e.offsetX === "undefined") {
		return Math.floor((e.pageX - $(e.target).offset().left) / c.size);
	} else {
		return Math.floor(e.offsetX / c.size);
	}
}

c.row = function (e) {
	if (typeof e.offsetY === "undefined") {
   		return Math.floor((e.pageY - $(e.target).offset().top) / c.size);
	} else {
		return Math.floor(e.offsetY / c.size);
	}
}

// select a piece to be moved
c.pick = function (e) {
	//console.log("PICK");
	var i;
	var row = c.row(e);
	var col = c.col(e);

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
	var col = c.col(e);
	var row = c.row(e);
	
	c.unselect();

	if ((row == p.row && col == p.col)
	|| ! c.canMove(p.num, c.human, p.row, p.col, row, col, true)
	|| (p.num == c.king && c.check(c.human, row, col))) {
		return;
	}
	c.logMove(c.human, p.num, p.col, p.row, col, row);
	p.row = row;
	p.col = col;
	if (c.threatened(c.ai, 0)) {
		$("ol li:last").append("+");
	//	$("#status").append("Check!").append($("<br>"));
	}


	c.drawBoard();
	c.drawAllPieces();
	c.aiKing();
}

c.logMove = function(player, piece_num, fc, fr, tc, tr) {
	var codes = new Array("K", "Q");
	var move_str = codes[piece_num]
		 + String.fromCharCode(fc+"a".charCodeAt(0)) + (c.n_rows - fr) + "-"
		 + String.fromCharCode(tc+"a".charCodeAt(0)) + (c.n_rows - tr);
	if (player === c.human) {
		$('ol').append(
			$('<li>').append(move_str)
		);
	} else {
		$('ol li:last').append(' ' + move_str);
	}
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
			var nr = king.row + dr;
			var nc = king.col + dc;
			if (nr >= c.n_rows || nr < 0
				 || nc >= c.n_cols || nc < 0)
				continue; // edge of board
			if (! c.check(c.ai, nr, nc)) {
				moves.push({"r":nr,"c":nc});
				//alert("Escape");
			} //else {
			//	alert("Check");
			//}
		}
	}
	//console.log(moves);
	if (moves.length == 0) {
		if (c.check(c.ai, king.row, king.col)) {
			// replace check with checkmate
			var v = $("ol li:last").html().replace(/\+$/g,'#');
			$("ol li:last").html(v);
			$('#status').append("Checkmate!");
		} else {
			$('ol li:last').append('?');
			$('#status').append("Stalemate.");
		}
		return;
	}
	var m = c.ir(moves.length);
	if (c.ps[c.human].piece[1].row == moves[m].r
		&& c.ps[c.human].piece[1].col == moves[m].c) {
		c.ps[c.human].piece[1] = {};
		$('ol li:last').append('?');
		$('#status').append("Stalemate (queen captured).");
	}
	c.logMove(c.ai, c.king, king.col, king.row, moves[m].c, moves[m].r);
	king.row = moves[m].r;
	king.col = moves[m].c;
	if (c.threatened(c.player, 0)) {
		 $("ol li:last").append("+");
//		$("#status").append("In check!").append($("<br>"));
	}
	c.drawBoard();
	c.drawAllPieces();
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

// bool: moving king here would be in check
c.check = function(player, row, col) {
	var king = c.ps[player].piece[0];
	var save_row = king.row;
	var save_col = king.col;
	king.row = row;
	king.col = col;
	var check = c.threatened(player, 0);
	king.row = save_row;
	king.col = save_col;
	return check;
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

// bool: player's from piece can capture opponent's to piece
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
			if (c.canMove(p.num, player, p.row, p.col, row, col, true)
				&& ((p.num != c.king) || !c.check(player, row, col))) {

      				var grd = c.ctx.createRadialGradient((col+.5)*c.size, (row+.5)*c.size,
						 0, (col+.5)*(c.size), (row+.5)*(c.size), c.size/2);
      				// light blue
      				grd.addColorStop((row+col+c.white_on_right)%2, '#ffffff');   
      				// dark blue
      				grd.addColorStop((row+col+!c.white_on_right)%2, '#00ff00');
      				c.ctx.fillStyle = grd;
				c.ctx.fillRect(col*c.size, row*c.size, c.size, c.size, 0.1); 
				//console.log(p.num + " " + player + " " + row + " " + col);
			}
		}
	}
}

