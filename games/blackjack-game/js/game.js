const suits = ["\u2660", "\u2665", "\u2666", "\u2663"];
const numbers = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];

class Card {
	constructor(suit, number) {
		this.suit = suits[suit];
		this.number = numbers[number];
		this.value = this.getPoint(number);
	}

	getPoint(number) {
		let value = 0;
		if (number === 0) {
			value = 11;
		} else if (number >= 10) {
			value = 10;
		} else {
			value = number + 1;
		}
		return value;
	}
}


class DeckOfCards {
	constructor() {
		this.allCards = [];

		for (let suit = 0; suit < 4; suit++) {
			for (let number = 0; number < 13; number++) {
				let card = new Card(suit, number);
				this.allCards.push(card);
			}
		}

		let temp = [];
		while (this.allCards.length > 0) {
			let randomNum = Math.floor(Math.random() * this.allCards.length);
			temp.push(this.allCards[randomNum]);
			this.allCards.splice(randomNum, 1);
		}
		this.allCards = temp;
	}

	getACard() {
		return this.allCards.shift();
	}
}


class Person {
	constructor() {
		this.cards = [];
		this.values = 0;
		this.numOfCards = 0;
		this.aces = 0;
		this.faces = 0;
		this.bj = false;
	}

	addACard(card) {
		this.cards.push(card);
		this.numOfCards += 1;
		this.values += this.addPoint(card);
		this.aces += this.haveAce(card.number);
		this.faces += this.haveFace(card.value);
		this.bj = this.isBJ();
	}

	addPoint(card) {
		if (card.number === "A" && this.aces > 1) {
			return 1;
		} else {
			return card.value;
		}
	}

	haveAce(number) {
		if (number === "A") {
			return 1;
		}
		return 0;
	}

	haveFace(value) {
		if (value === 10) {
			return 1;
		}
		return 0;
	}

	isBJ() {
		if (this.values === 21)
			return this.aces === 1 && this.faces === 1;
	}
	
}
/** set deck of cards */
let cards = new DeckOfCards();

/** set cards for player and dealer */
let player = new Person();
let dealer = new Person();

let gameOver = false;

//Müzik efekt bileşenleri tanimlandi
let backgroundSound = new Audio("./resources/sounds/main_sound.mp3");
let loseSound = new Audio("./resources/sounds/lose_sound.wav");
let winSound = new Audio("./resources/sounds/win_sound.wav");
let drawSound = new Audio("./resources/sounds/draw_sound.wav");
let hitSound = new Audio("./resources/sounds/card_hit_sound.wav");
let clickSound = new Audio("./resources/sounds/click_sound.wav");
let standSound = new Audio("./resources/sounds/stand_sound.wav");

const playersHand = document.getElementById("playersHand");
const playersPoint = document.getElementById("playersPoint");
const dealersHand = document.getElementById("dealersHand");
const dealersPoint = document.getElementById("dealersPoint");
const resultModal = document.getElementById("resultModal");
const restartModal = document.getElementById("restartModal");
const resultText = document.getElementById("resultText");

let numOfWins = JSON.parse(localStorage.getItem("wins"));
let numOfLoses = JSON.parse(localStorage.getItem("loses"));
let numOfDraws = JSON.parse(localStorage.getItem("draws"));
console.log(numOfWins + " " + numOfLoses + " " + numOfDraws);

player.addACard(cards.getACard());
dealer.addACard(cards.getACard());

player.addACard(cards.getACard());
dealer.addACard(cards.getACard());

dealersHand.innerHTML += `<div class="hands flex-center flex-column">${dealer.cards[0].suit + dealer.cards[0].number}</div>`;
let html = `
	<div class="hands flip-card">
		<div class="card">
			<div class="card__face face-down"></div>
			<div class="card__face card__face--back flex-center flex-column">
				${dealer.cards[1].suit + dealer.cards[1].number}
			</div>
		</div>
	</div>
`;
dealersHand.innerHTML += html;
dealersPoint.innerHTML = `[${dealer.cards[0].value}]`;


playersHand.innerHTML += `<div class="hands flex-center flex-column">${player.cards[0].suit + player.cards[0].number}</div>`;
playersHand.innerHTML += `<div class="hands flex-center flex-column">${player.cards[1].suit + player.cards[1].number}</div>`;
playersPoint.innerHTML = `[${player.values}]`;


/** check black jack or not */
if (player.bj) {
	if (dealer.bj) {
		numOfDraws++;
		localStorage.setItem("draws", numOfDraws);
		showResult("BERABERE");
		drawSound.play();
	} else {
		numOfWins++;
		localStorage.setItem("wins", numOfWins);
		showResult("Black Jack!!  KAZANDIN");
		winSound.play();
	}
}

/** player's choice */
hit = () => {
	let newCard = cards.getACard();
	player.addACard(newCard);

	playersHand.innerHTML += `<div class="hands flex-center flex-column">${newCard.suit + newCard.number}</div>`;
	playersPoint.innerHTML = `[${player.values}]`;
	hitSound.play();
	/* if point is over 21 => game over */
	isOver21();
};

function isOver21() {
	if (player.values > 21) {
		if (player.aces !== 0) {
			player.values -= 10;
			player.aces -= 1;
			playersPoint.innerHTML = `[${player.values}]`;
		} else {
			gameOver = true;
			numOfLoses++;
			localStorage.setItem("loses", numOfLoses);
			showResult("KAYBETTİN..");
			loseSound.play();
		}
	}
}

stand = () => {
	let card = document.querySelector('.card');
	card.classList.add('is-flipped');
	standSound.play();
	setTimeout("checkPoints()", 800);
};

checkPoints = () => {
	/* dealer get cards until point gets over 17 */
	dealersTurn();

	/* check who is winner */
	if (!gameOver) {
		whoIsWinner();
	}
};


dealersTurn = () => {
	while (dealer.values < 17) {
		let newCard = cards.getACard();
		dealer.addACard(newCard);
		dealersHand.innerHTML += `<div class="hands flex-center flex-column">${newCard.suit + newCard.number}</div>`;
	}
	dealersPoint.innerHTML = `[${dealer.values}]`;

	if (dealer.values > 21) {
		if (dealer.aces !== 0) {
			dealer.values -= 10;
			dealer.aces -= 1;
			dealersPoint.innerHTML = `[${dealer.values}]`;
			dealersTurn();
		} else {
			gameOver = true;
			numOfWins++;
			localStorage.setItem("wins", numOfWins);
			showResult("KAZANDIN!");
			winSound.play();
		}
	}
};

whoIsWinner = () => {
	let text = "";

	if (dealer.values < player.values) {
		numOfWins++;
		localStorage.setItem("wins", numOfWins);
		text = "KAZANDIN!";
		winSound.play();
	} else if (dealer.values > player.values) {
		numOfLoses++;
		localStorage.setItem("loses", numOfLoses);
		text = "KAYBETTİN..";
		loseSound.play();
	} else {
		// Eşitlik durumu
		numOfDraws++;
		localStorage.setItem("draws", numOfDraws);
		text = "BERABERE!";
		drawSound.play();
	}

	showResult(text);
}



function showResult(text) {
	const windowSize = window.matchMedia("(max-width: 480px)");
	const message = document.getElementById("message");

	resultModal.style.display = "block";
	resultText.innerHTML = text;

	document.getElementById("hit-btn").style.display = "none";
	document.getElementById("stand-btn").style.display = "none";

	setTimeout(() => {
		message.style.display = "block";
		if (windowSize.matches) {
			message.innerHTML = "YENİ BİR OYUN BAŞLATMAK İÇİN YENİLEME BUTONUNA BASIN.";
		} else {
			message.innerHTML = "YENİ BİR OYUN BAŞLATMAK İÇİN DESTEYE TIKLAYIN.";
		}
	}, 1200);
}

$(function () {
	/** when player click the deck */
	$('#deck').click(function () {
		$('#restartModal').fadeIn();
		clickSound.play();
	});
	$('#reload').click(function () {
		$('#restartModal').fadeIn();
		clickSound.play();
	});
	/** when player click the close button */
	$('.close-modal').click(function () {
		$('#resultModal').fadeOut();
		$('#restartModal').fadeOut();
		clickSound.play();
	});

});


newGame = () => {
	/* reload page */
	setTimeout("location.reload()", 500);
};
