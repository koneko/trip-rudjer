function startGame() {
	let st = localStorage.getItem("TRIP_ADMIN");
	socket.emit("startGame", st);
}
