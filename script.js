class GameMaster {
    constructor(pieceTypes, boardSize, tableSelector, imgDirectory, initalLayout, players){
        this.players = players;
        this.board = new Board(boardSize.width, boardSize.height, pieceTypes, players);
        initalLayout.forEach((spot) => {
            this.board.addPiece(
                {x: spot.x, y: spot.y}, 
                new Piece(spot.pieceTypeName, spot.playerNo)
            );
        });
        this.painter = new Painter(this.board, tableSelector, imgDirectory, this);
        this.painter.paintPieces();
        this.selection = {
            location: null,
        };
    }
    userClicked(location){
        var piece = this.board.getPieceAtLocation(location);
        var clickedSpot = $(this.painter.getSelectorOfCell(location));
        var clickedSpotClassCount = clickedSpot.attr('class') ?? [];
        clickedSpotClassCount = clickedSpotClassCount.length;
        
        console.log(clickedSpotClassCount);

        if(clickedSpotClassCount > 0){
            this.board.movePiece(this.selection.location, location);
            this.painter.paintPieces();
            this.painter.clearHighlights();
            this.selection = {
                location: null,
            };

            if(piece == null){
                this.painter.paintHighlights(this.board.pieceTypes[piece.pieceTypeName].getAllMoves(this.board.spots, location, this.players[piece.playerNo]));
                this.selection = {
                    location: location,
                };
            }
        }else if(piece == null && clickedSpotClassCount == 0 && this.selection.location !== null){
            this.painter.clearHighlights();
            this.selection = {
                location: null,
            };
        }else{
            this.painter.paintHighlights(this.board.pieceTypes[piece.pieceTypeName].getAllMoves(this.board.spots, location, this.players[piece.playerNo]));
            this.selection = {
                location: location,
            };
        }
    }
}
class Board {
    constructor(width, height, pieceTypes, players){
        if(width < 1){
            console.error('width must be min 1. ' + width + ' given');
            return false;
        }
        if(height < 1){
            console.error('height must be min 1. ' + height + ' given');
            return false;
        }

        this.pieceTypes = pieceTypes;
        this.players = players;

        this.spots = [];
        for(let i=0; i<height; i++){
            this.spots.push([]);
            for(let j=0; j<width; j++){
                this.spots[i].push(null);
            }
        }
    }
    getHeight(){
        return this.spots.length;
    }
    getWidth(){
        return this.spots[0].length;
    }
    getPieceAtLocation(location){
        return this.spots[location.y][location.x];
    }
    addPiece(location, piece){
        this.spots[location.y][location.x] = piece;
    }
    movePiece(from, to){
        this.addPiece(to, this.spots[from.y][from.x]);
        this.removePiece(from);
    }
    removePiece(location){
        this.spots[location.y][location.x] = null;
    }
}
class Painter {
    constructor(board, tableSelector, imgDirectory, gameMaster){
        // parameter sanity check
        if(!(board instanceof Board)){
            console.error("Given parameter `board` isn't an instance of class Board");
            return false;
        }
        if($(tableSelector).length < 1){
            console.error('Given parameter `tableSelector` must select at least 1 element. ' + 
                $(tableSelector).length + ' element(s) selected');
            return false;
        }
        if(typeof imgDirectory != 'string'){
            console.error("Given parameter `imgDirectory` isn't a string");
            return false;
        }
        if(!(gameMaster instanceof GameMaster)){
            console.error("Given parameter `gameMaster` isn't an instance of class GameMaster");
            return false;
        }

        this.board = board;
        this.tableSelector = tableSelector;
        this.gameMaster = gameMaster;
        this.imgDirectory = imgDirectory;

        $(this.tableSelector).empty();
        $(this.tableSelector).append('<tr>');
        $(this.tableSelector + ' tr:last').append('<td>');
        for(let i=0; i<this.board.getWidth(); i++){
            $(this.tableSelector + ' tr:last').append('<td>');
            $(this.tableSelector + ' tr td:last').text(String.fromCharCode(i + 97));
        }
        $(this.tableSelector + ' tr:last').append('<td>');

        for(let i=this.board.getHeight(); i>0; i--){
            $(this.tableSelector).append('<tr>');
            $(this.tableSelector + ' tr:last').append('<td>');
            $(this.tableSelector + ' tr td:last').text(i);

            for(let j=0; j<this.board.getWidth(); j++){
                $(this.tableSelector + ' tr:last').append('<td>');
                $(this.tableSelector + ' tr td:last').data({
                    x: j,
                    y: i - 1,
                });

                var painter = this;
                $(this.tableSelector + ' tr td:last').click(function(){
                    painter.gameMaster.userClicked({
                        x: $(this).data('x'),
                        y: $(this).data('y'),
                    });
                })
            }

            $(this.tableSelector + ' tr:last').append('<td>');
            $(this.tableSelector + ' tr td:last').text(i);
        }

        $(this.tableSelector).append('<tr>');
        $(this.tableSelector + ' tr:last').append('<td>');
        for(let i=0; i<this.board.getHeight(); i++){
            $(this.tableSelector + ' tr:last').append('<td>');
            $(this.tableSelector + ' tr td:last').text(String.fromCharCode(i + 97));
        }
        $(this.tableSelector + ' tr:last').append('<td>');
    }
    paintPieces(){
        for(let i=0; i<this.board.getHeight(); i++){
            for(let j=0; j<this.board.getWidth(); j++){
                var location = {
                    x: j,
                    y: i,
                };

                if(this.board.spots[i][j] == null){
                    $(this.getSelectorOfCell(location)).empty();
                }else{
                    if(this.board.spots[i][j].playerNo == 0){
                        var variation = 'line';
                    }else{
                        var variation = 'fill';
                    }
                    $(this.getSelectorOfCell(location)).html(
                        '<img src="' + 
                        this.imgDirectory + 
                        this.board.pieceTypes[
                            this.board.spots[i][j].pieceTypeName
                        ].image + '-' + 
                        variation + '.svg">'
                    );
                }
            }
        }
    }
    clearHighlights(){
        for(let i=0; i<this.board.getHeight(); i++){
            for(let j=0; j<this.board.getWidth(); j++){
                var location = {
                    x: j,
                    y: i,
                };

                $(this.getSelectorOfCell(location)).removeClass('movable');
                $(this.getSelectorOfCell(location)).removeClass('capturable');
                $(this.getSelectorOfCell(location)).removeClass('blink');
            }
        }
    }
    paintHighlights(highlights){
        for(let i=0; i<this.board.getHeight(); i++){
            for(let j=0; j<this.board.getWidth(); j++){
                var location = {
                    x: j,
                    y: i,
                };

                $(this.getSelectorOfCell(location)).toggleClass('movable', highlights[i][j].move);
                $(this.getSelectorOfCell(location)).toggleClass('capturable', highlights[i][j].capture);
            }
        }
    }
    clearBlinks(){
        for(let i=0; i<this.board.getHeight(); i++){
            for(let j=0; j<this.board.getWidth(); j++){
                var location = {
                    x: j,
                    y: i,
                };

                $(this.getSelectorOfCell(location)).removeClass('blink');
            }
        }
    }
    paintBlinks(blinks){
        for(let i=0; i<this.board.getHeight(); i++){
            for(let j=0; j<this.board.getWidth(); j++){
                var location = {
                    x: j,
                    y: i,
                };

                $(this.getSelectorOfCell(location)).toggleClass('blink', blinks[i][j]);
            }
        }
    }
    getSelectorOfCell(location){
        return this.tableSelector + 
            ' tr:nth-child(' + 
            ((this.board.getHeight() - location.y) + 1) + 
            ') td:nth-child(' + 
            (location.x + 2) + ')';
    }
}
class Piece {
    constructor(pieceTypeName, playerNo){
        this.pieceTypeName = pieceTypeName;
        this.playerNo = playerNo;
    }
}
class PieceType {
    constructor(behaviour, image){
        this.behaviour = behaviour;
        this.image = image;
    }
    getAllMoves(spots, location, player){
        return this.behaviour.getAllMoves(spots, location, player);
    }
}
class Behaviour {
    constructor(movements, captures = null, fires = false){
        this.movements = movements;
        this.captures = captures ?? movements;
        this.fires = fires;
    }
    getAllMoves(spots, location, player){
        var height = spots.length;
        var width = spots[0].length;
        var movable = [];
        var capturable = [];
        var result = [];

        for(let i=0; i<this.movements.length; i++){
            movable = movable.concat(this.movements[i].getAllMoves(location, spots, player));
        }
        for(let i=0; i<this.captures.length; i++){
            capturable = capturable.concat(this.captures[i].getAllMoves(location, spots, player, true));
        }

        for(let i=0; i<height; i++){
            result.push([]);
            for(let j=0; j<width; j++){
                result[i].push({
                    move: false,
                    capture: false,
                });
            }
        }

        movable.forEach(location => {
            result[location.y][location.x].move = true;
        });
        capturable.forEach(location => {
            result[location.y][location.x].capture = true;
        });

        return result;
    }
}
class Movement {
    // jump:            boolian:                   'jump' or 'slide'
    // locations:       [Location, ...]:           delta from previous place
    // rotate:          integer min 0:             count of times to rotate the distances around the originating Location clockwise
    // times:           intiger min 1 or Infinity: count of distances per move; infinite if 0
    // rotateForPlayer: boolian:                   whether to rotate distances or not for the player's direction
    //
    // EXAMPLE: rook:   [Movement(false, [{x:1,y:0}])]
    // EXAMPLE: knight: [Movement(true, [{x:2,y:1}]), Movement(true, [{x:1,y:2}])]
    constructor(jump, locations, rotate = 3, times = Infinity, rotateForPlayer = false) {
        this.jump = jump;
        this.locations = locations;
        this.rotate = rotate;
        this.times = times;
        this.rotateForPlayer = rotateForPlayer;
    }

    getAllMoves(location, spots, player, capture = false){
        var results = [];
        var locations = [];
        var rotationForPlayer = ['north', 'east', 'south', 'west'].indexOf(player.direction);
        var playerNo = player.playerNo;

        this.locations.forEach((locationq) => { // semi-deep copy
            locations = locations.concat({
                ...locationq,
            });
        });

        for(let i=0; i<rotationForPlayer; i++){ // rotate for player
            for(let j=0; j<locations.length; j++){
                locations[j] = {
                    x: locations[j].y,
                    y: locations[j].x * -1,
                };
            }
        }

        for(let i=0; i<=this.rotate; i++){
            var locationNow = {
                ...location,
            };
            var maxj = this.times;

            if(i != 0){
                for(let j=0; j<locations.length; j++){
                    locations[j] = {
                        x: locations[j].y,
                        y: locations[j].x * -1,
                    };
                }
            }

            for(let j=0; j<maxj; j++){
                for(let k=0; k<locations.length; k++){
                    locationNow.x += locations[k].x;
                    locationNow.y += locations[k].y;
                    
                    if(spots[locationNow.y] === undefined || spots[locationNow.y][locationNow.x] === undefined){
                        maxj = 0;
                        continue;
                    }
                    
                    var spot = spots[locationNow.y][locationNow.x];

                    if(capture && spot != null){
                        if(spot.playerNo != playerNo){
                            results = results.concat({
                                ...locationNow,
                            });
                        }
                        maxj = 0;
                        continue;
                    }else if(!capture && spot == null){
                        results = results.concat({
                            ...locationNow,
                        });
                    }else if(!capture && spot != null){
                        maxj = 0;
                        break;
                    }
                }
            }
        }

        return results;
    }

    /*if(capture && spot != null && spot.player != playerNo && spot.pieceTypeName == 'king'){
                        results = results.concat({
                            ...locationNow,
                            blink: true,
                        });
                    }else */
}
class Player {
    // colour:    string: CSS color name or hex number
    // direction: string: 'north', 'east', 'south', 'west'
    constructor(colour, playerNo, direction = 'north'){
        this.colour = colour;
        this.playerNo = playerNo;
        this.direction = direction;
    }
}

// mental classes
//
// Location = {
//     x: number,
//     y: number,
// };
//
// Highlights = [
//     [
//         {
//             move: boolian,
//             capture: boolian,
//         }, ...
//     ], ...
// ];

$(document).ready(() => {
    gameMaster = new GameMaster({
        rook:   new PieceType(new Behaviour([
            new Movement(false, [{x:1,y:0}]),
        ]), 'rook'), 
        bishop: new PieceType(new Behaviour([
            new Movement(false, [{x:1,y:1}]),
        ]), 'bishop'),
        queen:  new PieceType(new Behaviour([
            new Movement(false, [{x:1,y:1}]),
            new Movement(false, [{x:1,y:0}]),
        ]), 'queen'),
        king:   new PieceType(new Behaviour([
            new Movement(false, [{x:1,y:1}], 3, 1),
            new Movement(false, [{x:1,y:0}], 3, 1),
        ]), 'king'),
        knight: new PieceType(new Behaviour([
            new Movement(false, [{x:2,y:1}], 3, 1),
            new Movement(false, [{x:1,y:2}], 3, 1),
        ]), 'knight'),
        pawn: new PieceType(new Behaviour([
            new Movement(false, [{x:0,y:1}], 0, 1, true),
        ],[
            new Movement(false, [{x:-1,y:1}], 1, 1, true),
        ]), 'pawn'),
    }, {
        width: 6,
        height: 6,
    }, '#board', 'https://static.joekoop.com/chess/img/', [
        {x: 0, y: 0, pieceTypeName: 'rook', playerNo: 0},
        {x: 1, y: 0, pieceTypeName: 'knight', playerNo: 0},
        {x: 2, y: 0, pieceTypeName: 'queen', playerNo: 0},
        {x: 3, y: 0, pieceTypeName: 'king', playerNo: 0},
        {x: 4, y: 0, pieceTypeName: 'knight', playerNo: 0},
        {x: 5, y: 0, pieceTypeName: 'rook', playerNo: 0},
        {x: 0, y: 1, pieceTypeName: 'pawn', playerNo: 0},
        {x: 1, y: 1, pieceTypeName: 'pawn', playerNo: 0},
        {x: 2, y: 1, pieceTypeName: 'pawn', playerNo: 0},
        {x: 3, y: 1, pieceTypeName: 'pawn', playerNo: 0},
        {x: 4, y: 1, pieceTypeName: 'pawn', playerNo: 0},
        {x: 5, y: 1, pieceTypeName: 'pawn', playerNo: 0},

        {x: 0, y: 5, pieceTypeName: 'rook', playerNo: 1},
        {x: 1, y: 5, pieceTypeName: 'knight', playerNo: 1},
        {x: 2, y: 5, pieceTypeName: 'queen', playerNo: 1},
        {x: 3, y: 5, pieceTypeName: 'king', playerNo: 1},
        {x: 4, y: 5, pieceTypeName: 'knight', playerNo: 1},
        {x: 5, y: 5, pieceTypeName: 'rook', playerNo: 1},
        {x: 0, y: 4, pieceTypeName: 'pawn', playerNo: 1},
        {x: 1, y: 4, pieceTypeName: 'pawn', playerNo: 1},
        {x: 2, y: 4, pieceTypeName: 'pawn', playerNo: 1},
        {x: 3, y: 4, pieceTypeName: 'pawn', playerNo: 1},
        {x: 4, y: 4, pieceTypeName: 'pawn', playerNo: 1},
        {x: 5, y: 4, pieceTypeName: 'pawn', playerNo: 1},
    ],[
        new Player('white', 0, 'north'),
        new Player('black', 1, 'south'),
    ]);
});
