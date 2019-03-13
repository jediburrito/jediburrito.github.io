var origBoard;
let huPlayer = "red";
let aiPlayer = "black";
var startDepth = 8;
var availSlots = new Array(7);
var bestIndex = 3;
var minMaxxer = {alpha: -999, beta: 999};

const slots = document.querySelectorAll('.slot');
startGame();

function selectFirst(sym) {
	huPlayer = sym;
	aiPlayer = sym === "black" ? "red": "black";
	origBoard = new Array(6);
	startDepth = 12;
	for(let i = 0;  i < 6; i++) 
		origBoard[i] = new Array(7).fill("white");

	for(let i = 0; i < 7; i++) 
		availSlots[i] = {column: i, row: 5, value: 0};

	availSlots[3].value += 3;	
	
	for(let i = 0; i < slots.length; i++) {
		slots[i].style.backgroundColor = "white";
		slots[i].addEventListener('click', turnClick, false);
	}
	
	if(huPlayer === "black"){
		const freshBoard = origBoard.slice();
		miniMax(origBoard, aiPlayer, startDepth, availSlots, minMaxxer)
		turn(bestIndex, aiPlayer, 0);
	}
	
	document.querySelector('.selectFirst').style.display = "none";
}

function startGame() {
	document.querySelector('.endgame').style.display = "none";
	document.querySelector('.endgame .text').innerText = "";
	document.querySelector('.selectFirst').style.display = "block";

	for (let i = 0; i < slots.length; i++) {
		slots[i].style.backgroundColor = "white";
		slots[i].removeEventListener('click', turnClick, false);
	}
	
}

function turnClick(square) {
	if(document.getElementById(square.target.id).style.backgroundColor === "white") 
		turn(parseInt(square.target.id) %7, huPlayer);
}

function turn(slotId, player) {
	if(document.getElementById(slotId).style.backgroundColor !== "white")
		return;
	//if(player === aiPlayer) startDepth++;
	console.log("startDepth: " + startDepth);
	while(slotId < 35) {
		slotId += 7;
		if(document.getElementById(slotId).style.backgroundColor !== "white") {
			slotId -= 7;
			document.getElementById(slotId).style.backgroundColor = player;
			break;
		}
		document.getElementById(slotId - 7).style.backgroundColor = "white";
		document.getElementById(slotId).style.backgroundColor = player;
	}

	origBoard[Math.floor(slotId/7)][slotId%7] = player;
	availSlots[slotId%7].row--;
	//printBoard(origBoard);
	if(checkScore(origBoard, player, Math.floor(slotId/7), slotId%7) === 1000) {
		gameOver(player);
		return;
	}

	if(player === huPlayer){
		let temp = miniMax(origBoard, aiPlayer, startDepth, availSlots, minMaxxer, 0);
		console.log("value: " + temp);
		turn(bestIndex, aiPlayer);
	}
}

function gameOver(player) {
	for (let i = 0; i < slots.length; i++) {
		slots[i].removeEventListener('click', turnClick, false);
	}
	declareWinner(player === huPlayer ? "You win!" : "You Lose!");
}

function declareWinner(who) {
	document.querySelector(".endgame").style.display = "block";
	document.querySelector(".endgame .text").innerText = who;
}

function checkIfFull(availSlots) {
	for(let i = 0; i < 7; i++){
		if(availSlots[i].row >= 0)
			return false;
	}
		
	return true;
}

function checkScore(board, player, row, column) {
	let streak = 0;
	let blankStreak = 0;
	let score = 0;
	let bSwitch = true;
	let x = -1;
	let y = -1;

	for(let i = 0; i < 4; i++) {
		streak = blankStreak = 0;
		bSwitch = true;
		for(let j = 1; j < 4; j++) {
			if(row + (x * j) < 6 && row + (x * j) >= 0 && column + (y * j) < 7 && column + (y * j) >= 0){ 	
				if(board[row + (x * j)][column + (y * j)] === player && bSwitch) 
					streak++;
				else
					bSwitch = false;
				blankStreak++;
			}
				
				else break;
		}
		
		bSwitch = true;

		for(let j = 1; j < 4; j++) {
			if(row - (x * j) < 6 && row - (x * j) >= 0 && column - (y * j) < 7 && column - (y * j) >= 0) {
				if(board[row - (x * j)][column - (y * j)] === player && bSwitch)
					streak++;
				else
					bSwitch = false;
				blankStreak++;
			}
				else break;
		}

		y++;
		if(i === 2) {
		x = 0;
		y = -1;
		}	
		if(streak >= 3)
			return 1000;

		if(blankStreak >= 3)
		score += 2*(streak*streak);
	}	
	if(column === 3)
		score += 3;
		return score;
}

function scoreUpdate(board, player, slotTemp) {
	let otherPlayer = player === huPlayer ? aiPlayer : huPlayer;
	for(let i = 0; i < 7; i++) {
		slotTemp[i].value = checkScore(board, player, slotTemp[i].row, slotTemp[i].column);
		slotTemp[i].value += (checkScore(board, otherPlayer, slotTemp[i].row, slotTemp[i].column)/2);
		if(player === huPlayer)
			slotTemp[i].value *= -1;
	}
	return slotTemp;
}

function nextSpot(board, slotId) {
	while(slotId < 35 && board[Math.floor((slotId + 7)/7)][(slotId + 7)%7] === "white") 
		slotId += 7;

	return slotId;
}

function scoreSort(player , scoreTemp) {
	if(player === aiPlayer)
	scoreTemp.sort(function(a,b) {
		return a.value - b.value;
	}).reverse(function(a,b) {
		return a.value - b.value;
	});
	return scoreTemp;
}

function traverse(newBoard, player, depth, scoreTemp, newMinMaxxer, total) {
	
	let otherPlayer = player === huPlayer ? aiPlayer: huPlayer;
	let	bestScore =  player === huPlayer ? 999 : -999;
	scoreTemp = scoreUpdate(newBoard, player, scoreTemp);
	scoreTemp = scoreSort(player, scoreTemp);

	for(let i = 0; i < 7; i++) {
		if(scoreTemp[i].row >= 0) {
		let temp = total;
		newBoard[scoreTemp[i].row][scoreTemp[i].column] = player;
		scoreTemp[i].row--;
		if(player === aiPlayer && scoreTemp[i].value >= 1000) {
			if(depth === 0)
				bestIndex = scoreTemp[i].column;
		return (2000 - depth);
		}
		else if(player === huPlayer && scoreTemp[i].value <= -1000) {
			if(depth === 0)
				bestIndex = scoreTemp[i].column;
		return ((2000 * -1) + depth);
		}
		
		temp = miniMax(newBoard, otherPlayer, depth, scoreTemp, newMinMaxxer, temp);
		temp += scoreTemp[i].value;	
		//maximizer
		//TODO
		if(player === aiPlayer) {
			if(temp >= newMinMaxxer.beta) 
				return temp;
			if(temp >= bestScore) {
			 bestScore = temp;
			 bestIndex = scoreTemp[i].column;
			}
			if(bestScore >= 1000){
			 return bestScore;
			}
			
			if(bestScore> newMinMaxxer.alpha) newMinMaxxer.alpha = bestScore;	
			
		}
		//minimizer
		if(player === huPlayer) {
			if(temp <= newMinMaxxer.alpha)
				return temp;
			if(temp <= bestScore) {
			 bestScore = temp;
			 bestIndex = scoreTemp[i].column;
			}
			if(bestScore <= -1000) {
			 return bestScore;
			}
			
			if(temp < newMinMaxxer.beta) newMinMaxxer.beta = bestScore;
		}

		if(checkIfFull(scoreTemp))
			return bestScore;
		
		scoreTemp[i].row++;
		newBoard[scoreTemp[i].row][scoreTemp[i].column] = "white"; 
		}
	}
	return bestScore;
}

function copy(o) {
   var output, v, key;
   output = Array.isArray(o) ? [] : {};
   for (key in o) {
       v = o[key];
       output[key] = (typeof v === "object") ? copy(v) : v;
   }
   return output;
}

//miniMaxfunction max === aiPlayer min === huPlayer
function miniMax(freshBoard, player, depth, nextSlots, minMaxxer, total) {
	//create new boardState for traversal	
	const newBoard = new Array(6);
	for(let i = 0; i < 6; i++)
		newBoard[i] = freshBoard[i].slice();
	
	let scoreTemp = copy(nextSlots);
	if(checkIfFull(scoreTemp))
			return 0;

	if(depth === 0) {
		scoreTemp = scoreSort(player, scoreTemp);
		bestIndex = scoreTemp[0].column; 
		return scoreTemp.value + total;
	}
	let newMinMaxxer = copy(minMaxxer);
	//sort scoreSorter to sort slots for traversal
	return traverse(newBoard, player, depth - 1, scoreTemp, newMinMaxxer, total);
}
