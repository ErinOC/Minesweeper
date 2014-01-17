(function() {

    var REVEALED = [];
    var TALLY = 0;
    var SIZE = 5;
    var BOMBS = parseInt(SIZE + (SIZE/2));

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
                    divContent = "<div class='square unexposed'" + "id=" + i + "-" + j + "></div>";
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
            for (k = 0; k< (size + (size / 2)); k++) {
                aBomb = makeBomb();
                gameBoard[aBomb[0]][aBomb[1]] = true;
            };

            return gameBoard; 
        }
        //Will want to let the user input determine the size of the board.
        return setBombsOnBoard(generateBoard, SIZE, generateBombCoordinate);
    }();



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
            };
        }

        nearby.forEach(limitNearbySquaresToCoordinatesWithinBoardDimensions);            
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
        var el = document.getElementById(coordinate), 
        color = "number" + bombs;
        console.log(color);
        el.setAttribute("class", "square number" + bombs);
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
            TALLY += 1;
        } else {
            REVEALED.push(coordinate);
            handleEmptySquares(coordinate);
            TALLY += 1;
        };
    }

    var reveal = function() {
        console.log("TALLY", TALLY);
        var coordinate = this.id,
            currentValue = (BOARD[parseInt(coordinate[0])][parseInt(coordinate[2])]);
        if (currentValue === true) {
            this.setAttribute("class", "square bomb");
            // Make the board freeze if a bomb is hit.
            var squares = document.querySelectorAll("div.square");
            for (m=0; m<squareList.length; m++) {
                squareList[m].removeEventListener('click', markBomb);
                squareList[m].removeEventListener('dblclick', reveal);
            };
            var restartButton = document.getElementById("restart");
            restartButton.style.display = "block";

        } else {
            //Passes in the coordinate in "1-1" format, not [1, 1].
            checkForWin();
            return evaluate(coordinate);
        };
    } 

    var squareList = document.querySelectorAll("div.square");

    function checkForWin() {
        if (((SIZE * SIZE) - BOMBS) === TALLY) {
            alert("you win!");


            bombSquares = document.querySelectorAll(".unexposed");
            console.log("BOMB SQUARES", bombSquares);

        // function markRemainingBombs(element, index, array) {
        //     element.setAttribute("class", "bomb");
        // }
    
        // bombSquares.forEach(markRemainingBombs);

            for (var i=0; i<bombSquares.length; i++) {
                bombSquares[i].setAttribute("class", "square bomb");
            };
        };
    }

    function markBomb() {
        var coordinate = this;
        coordinate.setAttribute("class", "square marked");
        checkForWin();
    }

    var firstClick = function() {
        var m = 0;
        var timer = function() {
            console.log("yep");
        };
        //The firstClick function starts the timer.
        setInterval(timer, 1000);
        //Also ensures the first spot isn't a bomb.
        
        //After that, remove the firstClick listeners and add others.
        for (m=0; m<squareList.length; m++) {
            squareList[m].removeEventListener('click', firstClick);
            squareList[m].removeEventListener('dblclick', firstClick);
            squareList[m].addEventListener('click', markBomb);
            squareList[m].addEventListener('dblclick', reveal);
        };
    }

    for (m=0; m<squareList.length; m++) {
        squareList[m].addEventListener('click', firstClick);
        squareList[m].addEventListener('dblclick', firstClick);
    };

}());


//Also to do:
//Add win conditions.
//Don't allow for the first click to be a bomb.
//Add a timeout before the flag appears?
//Add a timer
//Get the size of the board from user input
//Add a timer and tracker for the number of bombs left.
//Make it have touch effects