class Piece {
    constructor(x, y, type, player) {
        this.location = [x, y];
        this.type = type;
        this.player = player;
    }
}
class PieceType {
    constructor(behaviour, image) {
        this.behaviour = behaviour;
        this.image = image;
    }
}
class Behaviour {
    constructor(move_movements, firstmove_movements = null, attack_movements = null, fire_movements = null) {
        this.movements = {};
        this.movements.move = move_movements;
        this.movements.firstmove = firstmove_movements;
        this.movements.attack = attack_movements;
        this.movements.fire = fire_movements;
    }
}
class Movement {
    // jump:      true or false, 'jump' or 'slide'
    // distances: array of [x, y]s integers, distance from last place on board
    // repeat:    intiger min -1, count of distances per move; infinate if -1
    // [up]:      'up' 'left' 'right' or 'down', useful correction for pawns
    constructor(jump, distances, repeat, up = 'up') {
        this.jump = jump;
        this.distances = distances;
        this.repeat = repeat;
        this.up = up;
    }

    // x, y: integers min 0, location of piece moving from
    // board: class Board, playing board to consider
    getLegalMoves(x, y, board){
        return 4;
    }
}
class Board {
    // width:         integer min 1, width of playing board
    // height:        integer min 1, height of playing board
    // imgDirectory:  absolute URL of directory conatining images; example: 'http://img.example.com/'
    // tableSelector: CSS selector of <tbody> to paint playing board to
    constructor(width, height, imgDirectory, tableSelector, pieceTypes) {
        if(width < 1){
            console.error('width must be min 1. ' + width + ' given');
            return false;
        }
        if(height < 1){
            console.error('height must be min 1. ' + height + ' given');
            return false;
        }
        if($(tableSelector).length < 1){
            console.error('tableSelector must select at least 1 element. ' + $(tableSelector).length + ' selected');
            return false;
        }

        this.imgDirectory = imgDirectory;
        this.tableSelector = tableSelector;
        this.pieceTypes = pieceTypes;

        this.board = [];
        for(let i=0; i<height; i++){
            this.board.push([]);
            for(let j=0; j<width; j++){
                this.board[i].push({
                    highlight: false,
                    piece: null,
                });
            }
        }

        $(this.tableSelector).empty();
        $(this.tableSelector).append('<tr>');
        $(this.tableSelector + ' tr:last').append('<td>');
        for(let i=0; i<this.board[0].length; i++){
            $(this.tableSelector + ' tr:last').append('<td>');
            $(this.tableSelector + ' tr td:last').text(String.fromCharCode(i + 97));
        }
        $(this.tableSelector + ' tr:last').append('<td>');

        this.board.forEach((row, index, array) => {
            $(this.tableSelector).append('<tr>');
            $(this.tableSelector + ' tr:last').append('<td>');
            $(this.tableSelector + ' tr td:last').text(array.length - index);

            row.forEach(cell => {
                $(this.tableSelector + ' tr:last').append('<td>');
            });

            $(this.tableSelector + ' tr:last').append('<td>');
            $(this.tableSelector + ' tr td:last').text(array.length - index);
        });

        $(this.tableSelector).append('<tr>');
        $(this.tableSelector + ' tr:last').append('<td>');
        for(let i=0; i<this.board[0].length; i++){
            $(this.tableSelector + ' tr:last').append('<td>');
            $(this.tableSelector + ' tr td:last').text(String.fromCharCode(i + 97));
        }
        $(this.tableSelector + ' tr:last').append('<td>');
    }
    imgUrl(type, colour) {
        if(colour == 0){
            return this.imgDirectory + type + '-line.svg';
        }else{
            return this.imgDirectory + type + '-fill.svg';
        }
    }
    addPiece(x, y, type, player) {
        if(
          y < 0 || 
          y > this.board.length - 1 ||
          x < 0 || 
          x > this.board[0].length - 1){
            console.error('Attempted to add piece out of bounds')
            return false;
        }

        this.board[y][x].piece = new Piece(x, y, type, player);
        this.paintCell(x, y);
        return true;
    }
    movePiece(from_x, from_y, to_x, to_y){
        this.addPiece(to_x, to_y, this.board[from_y][from_x].piece.type, this.board[from_y][from_x].piece.player);
        this.removePiece(from_x, from_y);
    }
    removePiece(x, y){
        this.board[y][x] = null;
        this.paintCell(x, y);
    }
    highlightCell(x, y, highlight = true){
        if(this.board === undefined){
            console.error('Attempted to highlight cell of empty board')
            return false;
        }

        this.board[y][x].highlight = highlight;
        this.paintCell(x, y);

        return true;
    }
    getSelectorOfCell(x, y) {
        return this.tableSelector + ' tr:nth-child('+(y+2)+') td:nth-child('+(x+2)+')';
    }
    highlightPieceMoves(x, y){
        return 4;
    }
    paintCell(x, y) {
        if(this.board[y][x].piece === null){
            $(this.getSelectorOfCell(x, y)).empty();
        }else{
            let player = this.board[y][x].piece.player;
            let image = this.pieceTypes[this.board[y][x].piece.type].image;
            $(this.getSelectorOfCell(x, y)).html('<img class="player-' + player + '" src="' + this.imgUrl(image, player) + '" />');
        }

        if(this.board[y][x].highlight){
            $(this.getSelectorOfCell(x, y)).addClass('highlight');
        }else{
            $(this.getSelectorOfCell(x, y)).removeClass('highlight');
        }
    }
};

$(document).ready(() => {
    behaviours = {
        pawn: new Behaviour(
            [
                new Movement(false, [[0, 1]], 0),
            ],
            [
                new Movement(false, [[0, 1]], 1),
            ],
            [
                new Movement(false, [[1, 1]], 0),
                new Movement(false, [[-1, 1]], 0),
            ]
        ),
    };
    pieceTypes = {
        pawn_white: new PieceType(behaviours.pawn, 'pawn'),
    };
    board = new Board(6, 6, 'https://static.joekoop.com/chess/img/', '#board', pieceTypes);
    board.addPiece(0, 4, 'pawn_white', 0);
});