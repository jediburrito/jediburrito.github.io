let origBoard = new Array(6);
	for(let i = 0;  i < 6; i++) 
		origBoard[i] = new Array(7).fill('');
let huPlayer = 'X';
let aiPlayer = 'O';
var turnCount = 30;
$(document).ready(function() {
	console.log('working');
	})


const slots = document.querySelectorAll('.slot');
startGame();

function selectFirst(sym) {
	huPlayer = sym;
	aiPlayer = sym === 'O' ? 'X': 'O'; 
		for(let i = 0;  i < 6; i++) 
			origBoard[i].fill('');
	
	for(let i = 0; i < slots.length; i++)
		slots[i].addEventListener('click', turnClick, false);
	
	if(huPlayer === 'O') 
		turn(miniMax(origBoard, aiPlayer, turnCount).index, aiPlayer);
	
	document.querySelector('.selectFirst').style.display = "none";
}

function startGame() {
	document.querySelector('.endgame').style.display = "none";
	document.querySelector('.endgame .text').innerText = "";
	document.querySelector('.selectFirst').style.display = "block";
	for(let i = 0; i < slots.length; i++) {
		slots[i].innerText = '';
		slots[i].style.removeProperty('background-color');
	}
}

function turnClick(square) {
	if(document.getElementById(square.target.id).innerHTML === '') 
		turn(parseInt(square.target.id) %7, huPlayer);
}

function turn(slotId, player) {
	//console.log("turn: " + turnCount);
	turnCount++;
	if(document.getElementById(slotId).innerHTML !== '')
		return;
	while(slotId < 35) {
		slotId += 7;
		if(document.getElementById(slotId).innerHTML !== '') {
			slotId -= 7;
			document.getElementById(slotId). innerHTML = player;
			break;
		}
		document.getElementById(slotId -  7).innerHTML = '';
		document.getElementById(slotId).innerHTML = player;
	}
	origBoard[Math.floor(slotId/7)][Math.floor(slotId%7)] = player;
	//console.log("Player: " + player + " move: " + slotId);
	if(checkScore(origBoard, player, slotId, turnCount) === 1000){ 
		gameOver(player);
		return;
	}
	//huPlayer = player === 'X' ? 'O' : 'X';
	if(player === huPlayer)
		turn(miniMax(origBoard, aiPlayer, turnCount).index, aiPlayer);
	return;
}

function checkScore(board, player, slotId) {
	slotId = nextSpot(board, slotId);
	let winStreak = streak = score = swap  =  0;
	let row = Math.floor(slotId/7);
	let column = Math.floor(slotId%7);
	let x = y = -1;
	let edge = false;

	for(let i = 0; i < 4; i++) {
		streak = winStreak = swap = 0;
		edge = false;
		for(let j = 1; j < 4; j++) {
			if(row + (x * j) < 6 && row + (x * j) >= 0 && column + (y * j) < 7 && column + (y * j) >= 0) {
				if(board[row + (x * j)][column + (y * j)] === player ) {
					if(swap === 0)
					winStreak++;
					streak++;
				}
				else if(board[row + (x * j)][column + (y * j)] === '') {
				if(swap === 0) 
					edge = true;
				streak++;
				swap = 1;
				}
			 else break;
			}
		}
		swap = 0;
		
		for(let j = 1; j < 4; j++) {
			if(row - (x * j) < 6 && row - (x * j) >= 0 && column - (y * j) < 7 && column - (y * j) >= 0) {
				if(board[row - (x * j)][column - (y * j)] === player ) {
					if(swap === 0)
					winStreak++;
					streak++;
				}
				else if(board[row - (x * j)][column - (y * j)] === '') {
				if(edge === true && winStreak > 1)
					winStreak > 1 ? score += 100 : edge = false;
				edge = false;
				streak++
				swap = 1;
				}
			 else break;
			}
		}

		y++;
		if(i === 2) {
		x = 0;
		y = -1;
		}	

		if(winStreak >= 3)
			return 1000;

		if(streak >= 3) {
		score += (2*winStreak) + streak;
		score++;
	}
	else
		score -= 2;

	}	
		return score;
}

function gameOver(player) {
	turnCount = 0;
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
		if(board[0][i] === '')
			return false;
	return true;
}

function nextSpot(board, slotId) {
	while(slotId < 35 && board[Math.floor((slotId + 7)/7)][Math.floor((slotId + 7)%7)] === '') 
		slotId += 7;

	return slotId;
}

function miniMax(board, player, depth) {
	var scoreSort = [];
	var values = new Array(7);
	var otherPlayer = player === aiPlayer ? huPlayer : aiPlayer;
	depth--;
	//create newBoard for next move
	var newBoard = new Array(6);
		for(let i = 0; i < 6; i++) {
			newBoard[i] = new Array(7);
			for(let j = 0; j < 7; j++)
				newBoard[i][j] = board[i][j];
		}
		//check and sort each next slot value. if slot not available pass.
	for(let i = 0; i < 7; i++) {
		if(newBoard[0][i] === '') {
			let score = {value: checkScore(newBoard, player, i), index: i};
		

		if(score.value === 1000) {
			player === huPlayer ? score.value *= -1 : score.value;
			return score;
		}
		
		if(i === 3)
			score.value += 3;
	
		score.value += checkScore(newBoard, otherPlayer, i);
		
		let index = scoreSort.length;
		if(index === 0)
			scoreSort.push(score);
		else {
		while(index- 1 >= 0 && score.value > scoreSort[index - 1].value) index--;
		scoreSort.splice(index, 0, score);
			}
		}
	}
		if(depth <= 0) {
			//console.log("index: "+ scoreSort[0].index + " value: " + scoreSort[0].value);
			player === huPlayer ? scoreSort[0].value *= -1: scoreSort[0].value;

			return scoreSort[0];
		}

	let	bestScore = {value: -1000, index: 0};

		if(player === huPlayer)
			bestScore.value = 1000;

	//replace checkScore with miniMax score at index. Max score for aiPlayer, Min for huPlayer
		let temp;
	for(let i = 0; i < scoreSort.length; i++) {
		let index = nextSpot(newBoard, scoreSort[0].index);
		newBoard[Math.floor(index/7)][Math.floor(index%7)] = player;
		
		if(checkIfFull(newBoard)) 
			return scoreSort[0];
		
		if(player === huPlayer)
			scoreSort[0].value *= -1;
		
		temp = miniMax(newBoard, otherPlayer, depth).value;
		if(player === aiPlayer) {
			if(temp > 999)
				return scoreSort[0];
			scoreSort[0].value > bestScore.value ? bestScore = scoreSort.shift() : scoreSort.shift();
		}

		if(player === huPlayer) {
			if(temp < -999)
				return scoreSort[0];
			scoreSort[0] < bestScore.value ? bestScore = scoreSort.shift() : scoreSort.shift();
				}
				
		newBoard[Math.floor(index/7)][Math.floor(index%7)] = ''; 

	}
	//console.log("finalScore = " + bestScore.value + " finalIndex: " + bestScore.index);

	//flip score for minMax
	return bestScore;
}
