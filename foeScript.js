var origBoard;
let huPlayer = "red";
let aiPlayer = "black";
var startDepth = 2;

const slots = document.querySelectorAll('.slot');
startGame();

function selectFirst(sym) {
	huPlayer = sym;
	aiPlayer = sym === "black" ? "red": "black";
	origBoard = new Array(6);
	for(let i = 0;  i < 6; i++) 
		origBoard[i] = new Array(7).fill("white");
	
	for(let i = 0; i < slots.length; i++) {
		slots[i].style.backgroundColor = "white";
		slots[i].addEventListener('click', turnClick, false);
	}
	
	if(huPlayer === "black")
		turn(miniMax(origBoard, aiPlayer, startDepth).index, aiPlayer);
	
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

	origBoard[Math.floor(slotId/7)][Math.floor(slotId%7)] = player;

	if(checkScore(origBoard, player, slotId) === 1000) {
		gameOver(player);
		return;
	}

	if(player === huPlayer){
		let nextMove = miniMax(origBoard, aiPlayer, startDepth);
		turn(nextMove.index, aiPlayer);
	}
}


function checkScore(board, player, slotId) {
	slotId = nextSpot(board, slotId);
	let streak = 0;
	let score = 0;
	let row = Math.floor(slotId/7);
	let column = Math.floor(slotId%7);
	let x = -1;
	let y = -1;

	for(let i = 0; i < 4; i++) {
		streak = 0;
		for(let j = 1; j < 4; j++) {
			if(row + (x * j) < 6 && row + (x * j) >= 0 && column + (y * j) < 7 && column + (y * j) >= 0) 	
				if(board[row + (x * j)][column + (y * j)] === player) 
					streak++;
				else break;
		}
		
		for(let j = 1; j < 4; j++) {
			if(row - (x * j) < 6 && row - (x * j) >= 0 && column - (y * j) < 7 && column - (y * j) >= 0) 
				if(board[row - (x * j)][column - (y * j)] === player)
					streak++;
				else break;
		}

		y++;
		if(i === 2) {
		x = 0;
		y = -1;
		}	
		if(streak === 3)
			return 1000;
		
		score += 2*(streak*streak);
	}	
		return score;
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

function checkIfFull(board) {
	for(let i = 0; i < 7; i++)
		if(board[0][i] === "white")
			return false;
	return true;
}

function nextSpot(board, slotId) {
	while(slotId < 35 && board[Math.floor((slotId + 7)/7)][Math.floor((slotId + 7)%7)] === "white") 
		slotId += 7;

	return slotId;
}

function miniMax(board, player, depth) {
	var scoreSort = [];
	var values = new Array(7);
	var otherPlayer = player === aiPlayer ? huPlayer : aiPlayer;
	//create newBoard for next move
	var newBoard = new Array(6);
		for(let i = 0; i < 6; i++) {
			newBoard[i] = new Array(7);
			for(let j = 0; j < 7; j++)
				newBoard[i][j] = board[i][j];
		}
		//check and sort each next slot value. if slot not available pass.
	for(let i = 0; i < 7; i++) {
		if(newBoard[0][i] === "white") {
			let score = {value: checkScore(newBoard, player, i), index: i};
		

		if(score.value === 1000) {
			player === huPlayer ? score.value *= -1 : score.value;
			return score;
		}

		if(i === 3)
			score.value += 3;
		//checkScore for other player and award half points
		score.value += Math.floor((checkScore(newBoard, otherPlayer, i)/2));

		let index = scoreSort.length;
		if(index === 0)
			scoreSort.push(score);
		else {
		while(index- 1 >= 0 && score.value > scoreSort[index - 1].value) index--;
		scoreSort.splice(index, 0, score);
			}
		}
	}
		if(depth === 0) {
			player === huPlayer ? scoreSort[0].value *= -1: scoreSort[0].value;
			return scoreSort[0];
		}

	let	bestScore = {value: -1000, index: 0};

		if(player === huPlayer)
			bestScore.value = 1000;

	//replace checkScore with miniMax score at index. Max score for aiPlayer, Min for huPlayer
		depth--;

	for(let i = 0; i < scoreSort.length; i++) {
		let index = nextSpot(newBoard, scoreSort[0].index);
		newBoard[Math.floor(index/7)][Math.floor(index%7)] = player;
		
		if(checkIfFull(newBoard)) {
			return scoreSort[0];
		}
		if(player === huPlayer)
			scoreSort[0] *= -1;
		scoreSort[0].value += miniMax(newBoard, otherPlayer, depth).value;

		if(player === aiPlayer)
				scoreSort[0].value > bestScore.value ? bestScore = scoreSort.shift() : scoreSort.shift();
		
		if(player === huPlayer)
					scoreSort[0].value < bestScore.value ? bestScore = scoreSort.shift() : scoreSort.shift();

		newBoard[Math.floor(index/7)][Math.floor(index%7)] = "white"; 

	}

	//flip score for minMax
	return bestScore;
}
