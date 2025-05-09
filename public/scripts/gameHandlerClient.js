socket.on("startGame", async (data) => {
	await load("./html/client.html");
	animate(data.image);
	let arr = [data.image, ...data.guesses];
	arr = arr.sort(() => Math.random() - 0.5);
	let btns = [
		document.getElementById("guess1"),
		document.getElementById("guess2"),
		document.getElementById("guess3"),
		document.getElementById("guess4"),
	];
	btns.forEach((item, idx) => {
		item.textContent = arr[idx];
		if (arr[idx] == data.image) {
			item.onclick = () => guessCorrect();
		} else {
			item.onclick = () => guessIncorrect();
		}
	});
});

function guessCorrect() {
	let btns = [
		document.getElementById("guess1"),
		document.getElementById("guess2"),
		document.getElementById("guess3"),
		document.getElementById("guess4"),
	];
	btns.forEach((item) => {
		item.style.visible = false;
	});
	socket.emit("playerGuess", "correct");
}

function guessIncorrect() {
	let btns = [
		document.getElementById("guess1"),
		document.getElementById("guess2"),
		document.getElementById("guess3"),
		document.getElementById("guess4"),
	];
	btns.forEach((item) => {
		item.style.visible = false;
	});
	socket.emit("playerGuess", "incorrect");
}
