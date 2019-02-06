var origBoard = new Array(6);
let huPlayer = 'X';
let aiPlayer = 'O';
var depth = 9;
for(let i = 6; i < 6; i++)
	origBoard[i] = new Array(7);

const slots = document.querySelectorAll('.slot');
startGame();

function selectFirst(sym) {
	huPlayer = sym;
	aiPlayer = sym === 'O' ? 'X': 'O';
	origBoard = new Array(6); 
		for(let i = 0;  i < 6; i++) 
			origBoard[i] = new Array(7).fill('');
	
	for(let i = 0; i < slots.length; i++)
		slots[i].addEventListener('click', turnClick, false);
	
	if(huPlayer === 'O') 
		turn(miniMax(origBoard, aiPlayer, 0).index, aiPlayer);
	
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
	//|| checkIfFull(origBoard)) {
	if(checkScore(origBoard, player, slotId) === 1000 ){ 
		console.log("trigger");
		gameOver(player);
		return;
	}
	//huPlayer = player === 'X' ? 'O' : 'X';

	if(player === huPlayer){
		let nextMove = miniMax(origBoard, aiPlayer, 6);
		console.log(nextMove.index);
		turn(nextMove.index, aiPlayer);
	}
	
}

function checkScore(board, player, slotId) {
	slotId = nextSpot(board, slotId);
	let streak = 0;
	let score = 0;
	let connect = 0;
	let row = Math.floor(slotId/7);
	let column = Math.floor(slotId%7);
	let x = -1;
	let y = -1;

	for(let i = 0; i < 4; i++) {
		streak = 0;
		connect = 0;

		for(let j = 1; j < 4; j++) {
			if(row + (x * j) < 6 && row + (x * j) >= 0 && column + (y * j) < 7 && column + (y * j) >= 0) 
				if(board[row + (x * j)][column + (y * j)] === player) 
					streak++;
				else if(board[row + (x * j)][column + (y * j)] === '')
				connect++;
				else break;
		}
		
		for(let j = 1; j < 4; j++) {
			if(row - (x * j) < 6 && row - (x * j) >= 0 && column - (y * j) < 7 && column - (y * j) >= 0)
				
				if(board[row - (x * j)][column - (y * j)] === player)
					streak++;
				else if(board[row - (x*j)][column - (y * j)] === '')
					connect++;
				else break;
		}

		y++;
		if(i === 2) {
		x = 0;
		y = -1;
		}	

		if(streak >= 3){
			console.log(streak);
			return 1000;
		}
		if(connect >= 3) {
		score += 2*(streak*streak);
		score++;
	}

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
		//checkScore for other player and award half points

		score.value += (checkScore(newBoard, otherPlayer, i)/2);

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
			//console.log("index: "+ scoreSort[0].index + " value: " + scoreSort[0].value);
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
			scoreSort[0].value *= -1;
		
		scoreSort[0].value += miniMax(newBoard, otherPlayer, depth).value;
		 			

		if(player === aiPlayer){
			if(scoreSort[0].value >= 1000)
				return scoreSort[0];
			else
				scoreSort[0].value > bestScore.value ? bestScore = scoreSort.shift() : scoreSort.shift();
		}

		if(player === huPlayer){

			if(scoreSort[0].value <= -1000)
				return scoreSort[0];
			else
					scoreSort[0].value < bestScore.value ? bestScore = scoreSort.shift() : scoreSort.shift();
				}
				
		newBoard[Math.floor(index/7)][Math.floor(index%7)] = ''; 

	}
	console.log("index: "+ bestScore.index + " value: " + bestScore.value);
	//flip score for minMax
	return bestScore;
}
