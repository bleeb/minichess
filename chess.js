var c = {};

window.onload = function () {
	c.init();
	c.drawBoard(c.white_on_right);
	function ir(i) { return Math.floor(Math.random()*i) }
	setTimeout(function () {
	c.drawPiece(ir(6), ir(4), ir(4), ir(2), ir(10));
	}, 1000);
}

c.init = function () {
	c.board = document.getElementById('board');
	c.ctx = c.board.getContext('2d');
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
	c.p.sheet_width = 413;
}

c.drawBoard = function (white_on_right) {
	var row;
	var col;

	c.ctx.fillStyle = "rgb(0,255,0)";
	for (row = 0; row < c.n_rows; ++row) {
		for (col = 0; col < c.n_cols; ++col) {
			if ((row+col)%2 == white_on_right) {
				c.ctx.fillRect(row*c.size, col*c.size, c.size, c.size);
			}
		}
	}
}

c.drawPiece = function(piece, row, col, player, set) {
	console.log(piece + " " + row + " " + col + " " + player + " " + set);
	srcX = c.p.sx[player];
	for (i = 0; i < piece; ++i) {
		srcX += c.p.widths[i];
	}	
	srcW = c.p.widths[piece];
	srcY = c.p.sy + set * c.p.height;
	srcH = c.p.height;
	destX = row * c.size;
	destY = col * c.size;
	destW = c.size;
	destH = c.size;	 
	c.ctx.drawImage(c.p.sheet,srcX,srcY,srcW,srcH,destX,destY,destW,destH);
}

