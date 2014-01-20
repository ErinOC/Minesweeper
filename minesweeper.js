(function() {

    var REVEALED = [],
        TALLY = 0,
        SIZE = 5,
        NUMOFBOMBS = parseInt(SIZE + (SIZE/2)),
        BOMBSLEFT = NUMOFBOMBS,
        TIMER = null,
        MINESWEEPER = MINESWEEPER || {};


    (function(ms, size) {
        var INELIGIBLESQUARES = [],
            BOARD = [];
        ms.board = function(size) {
            var i = 0, 
                j = 0,
                myBoard = [];
                divContent = 0;
            for (i=0; i<size; i++) {
                myBoard.push(new Array(size));   
                for (j = 0; j<size; j++) { 
                    myBoard[i][j] = false;
                    divContent = "<div class='square unexposed'" + "id=" + i + "-" + j + "></div>";
                    currentContent = document.getElementById('board').innerHTML;
                    document.getElementById('board').innerHTML = currentContent + divContent;
                };  
            };
            BOARD = myBoard;
        }

        var generateBombCoordinate = function() {
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

        var testIfBombCanBePlaced = function(coord) {
            var i = 0;
            for (i = 0; i<INELIGIBLESQUARES.length; i++) {  
                if (INELIGIBLESQUARES[i][0] === coord[0] && INELIGIBLESQUARES[i][1] === coord[1]) {
                    console.log("can't place a bomb there");
                    return false;
                };
            };
            return true;
        }  

        ms.setBombsOnBoard = function(coord) {
            var aBomb = [];
            INELIGIBLESQUARES.push(coord);
            //Generate bombs until the desired number is reached.
            while ((INELIGIBLESQUARES.length -1) < NUMOFBOMBS) {
                aBomb = generateBombCoordinate();
                //Test if the coordinate is available, and if so place bomb there.
                if (testIfBombCanBePlaced(aBomb) === true) {
                    BOARD[aBomb[0]][aBomb[1]] = true;
                    INELIGIBLESQUARES.push(aBomb);
                };
            }
            return BOARD;
        }

    }(MINESWEEPER, SIZE));

    //Create empty board.
    MINESWEEPER.board(SIZE);

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
        el.removeEventListener('click', markBomb);
        el.removeEventListener('dblclick', reveal);
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
        el.removeEventListener('click', markBomb);
        el.removeEventListener('dblclick', reveal);

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
            TALLY += 1;
            handleEmptySquares(coordinate);
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
            //Stop the timer.
            clearInterval(TIMER);
            //Show "Play again" button.
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
        if (((SIZE * SIZE) - NUMOFBOMBS) === TALLY) {
            alert("you win!");
            clearInterval(TIMER);
            bombSquares = document.querySelectorAll(".unexposed");
            console.log("BOMB SQUARES", bombSquares);
            function markRemainingBombs(element, index, array) {
                element.setAttribute("class", "bomb");
            }
            
            for (var t=0; t<bombSquares.length; t++) {
                bombSquares[t].setAttribute("class", "square bomb");
            };
        };
    }

    function markBomb() {
        var coordinate = this;
        coordinate.setAttribute("class", "square marked");
        BOMBSLEFT = (BOMBSLEFT - 1);
        document.getElementById("bombs-left").innerHTML = BOMBSLEFT;
        checkForWin();
    }

    var firstClick = function() {
        var m = 0,
            clickedCoordinate = [],
            minutes = 0,
            seconds = 0;
        var timing = function() {
            if ((seconds + 1) % 60 === 0) {
                minutes += 1;
                seconds = 0;
            } else {
                seconds +=1;
            }
            document.getElementById("timer").innerHTML = minutes + ":" + "0"+seconds;
        };

        //The firstClick function starts the timer.
        TIMER = setInterval(timing, 1000);

        //Also ensures the first spot isn't a bomb.
        clickedCoordinate = [parseInt(this.id[0]), parseInt(this.id[2])];
        console.log(clickedCoordinate);

        //And sets the bombs on the board.
        MINESWEEPER.setBombsOnBoard(clickedCoordinate);

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

    document.getElementById("bombs-left").innerHTML = BOMBSLEFT;
    document.getElementById("timer").innerHTML = "0:00";

}());


//Also to do:
//Check win conditions.
//Fix bomb scoreboard.
//Add a timeout before the flag appears?
//Get the size of the board from user input
//Add a timer and tracker for the number of bombs left.
//Make it have touch effects
//Do the math on the pixels and stop winging it.