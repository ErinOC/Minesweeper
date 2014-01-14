(function() {
    var BOARD = function(size) {
        function generateBoard(size) {
            var board = [],
                i = 0, 
                j = 0,
                divContent = 0;

            for (i=0; i<size; i++) {
                board.push(new Array(size));   
                for (j = 0; j<size; j++) { 
                    board[i][j] = false;
                    divContent = "<div class='square'" + "id=" + i + "-" + j + "></div>";
                    currentContent = document.getElementById('board').innerHTML;
                    document.getElementById('board').innerHTML = currentContent + divContent;
                };  
            };
            return board;
        }

        function generateBombCoordinate() {
            var i = 0,
                coordX = 0,
                coordY = 0,
                coordinate = [0, 0];

            for (i; i<5; i+=1) { 
                coordX = Math.ceil((Math.random() * 5) - 1);
                coordY = Math.ceil((Math.random() * 5) - 1);
                coordinate = [coordX, coordY];
                return coordinate;
            };
        }

        function setBombsOnBoard(makeBoard, size, makeBomb) {
            var gameBoard = makeBoard(size),
            aBomb = [];
            //Make a number of bombs appropriate for the size of the board.
            for (k = 0; k<3; k++) {
                aBomb = makeBomb();
                gameBoard[aBomb[0]][aBomb[1]] = true;
            };

            return gameBoard; 
        }
        //Will want to let the user input determine the size of the board.
        return setBombsOnBoard(generateBoard, 5, generateBombCoordinate);
    }();

    var REVEALED = [];

    function findNearbySquares(x, y) {
        var nearby = [[x+1, y], [x-1, y],
                      [x, y+1], [x, y-1],
                      [x-1, y-1], [x+1, y-1],
                      [x-1, y+1], [x+1, y+1]
                      ],
                    i = 0,
                    j = 0,
                    nearbySquaresOnBoard = [];

        function limitNearbySquaresToCoordinatesWithinBoardDimensions(element, index, array) {
            if ((element[0] >= 0 && element[1] >= 0) && (element[0] < 5 && element[1] < 5)) {
                nearbySquaresOnBoard.push(element);
            }
        }

        nearby.forEach(limitNearbySquaresToCoordinatesWithinBoardDimensions)            
        return nearbySquaresOnBoard;
    }

    function howManyBombs(nearbySquares) {
        var numberOfBombs = 0;

        function iterateIfABomb(element, index, array) {
            if ( (BOARD[parseInt(element[0])][parseInt(element[1])]) === true) {
                numberOfBombs += 1;
            };
        }

        nearbySquares.forEach(iterateIfABomb);
        return numberOfBombs;
    }

    function setNumericValue(coordinate, bombs) {
        var el = document.getElementById(coordinate);
        el.setAttribute("class", "square number");
        el.innerHTML = bombs;
    }

    function checkIfNeighborWasAlreadyEvaluated(coordinate) {

        //If there is a match in the list, return true, otherwise false.
        function isCoordinateInRevealedList(element, index, array) {
            return (element === coordinate);
        }

        return REVEALED.some(isCoordinateInRevealedList);
    }

    function handleEmptySquares(coordinate) {
        var el = document.getElementById(coordinate),
            t = [],
            s = 0,
            i = 0,
            j = 0,
            formatted = "",
            nearby = findNearbySquares(parseInt(coordinate[0]), parseInt(coordinate[2]));
        el.setAttribute("class", "square number");

        //For each surrounding square, evaluate if not already revealed.
        function evaluateSurroundingSquare(element, index, array){
            formatted = element[0] + "-" + element[1];
            if (checkIfNeighborWasAlreadyEvaluated(formatted) === false) {
                evaluate(formatted);
            };
        }
        
        nearby.forEach(evaluateSurroundingSquare);
    }
      
    var evaluate = function(coordinate) {
        var a = parseInt(coordinate[0]),
            b = parseInt(coordinate[2]),
            nearby = findNearbySquares(a, b),
            bombs = howManyBombs(nearby),
            i = 0,
            newSquare = [];
        if (bombs !== 0) {
            setNumericValue(coordinate, bombs);
            REVEALED.push(coordinate);
        } else {
            REVEALED.push(coordinate);
            handleEmptySquares(coordinate);
        }
    }

    var reveal = function() {
        var coordinate = this.id,
            currentValue = (BOARD[parseInt(coordinate[0])][parseInt(coordinate[2])]);
        if (currentValue === true) {
            this.setAttribute("class", "square bomb");
            // Make the board freeze if a bomb is hit.
            var squares = document.querySelectorAll("div.square");
            for (m=0; m<squareList.length; m++) {
                squareList[m].removeEventListener('click', reveal);
            };
            //And display a button to restart.
        } else {
            //Passes in the coordinate in "1-1" format, not [1, 1].
            return evaluate(coordinate);
        }
    } 

    function markBomb() {
        var coordinate = this;
        coordinate.setAttribute("class", "square marked");
    } 

    var squareList = document.querySelectorAll("div.square");

    for (m=0; m<squareList.length; m++) {
        squareList[m].addEventListener('click', reveal);
    };

    for (m=0; m<squareList.length; m++) {
        squareList[m].addEventListener('dblclick', markBomb);
    };

    //Need to add set-timeout here.

}());


//Also to do:
// Add bomb gif. Make different numbers different colors.
//Add a timer and tracker for the number of bombs left.
//Add a bomb png and a flag png.
// Add an outer beveled border and beleing to inner squares.
//Get an icon for the bombs and smiley, etc.? No images??
//Make it have touch effects!!! Usable on iPad, iPhone.