function createGame() {
	const ime = localStorage.getItem("TRIP_ime");
	const prezime = localStorage.getItem("TRIP_prezime");
	socket.emit("create", { ime, prezime });

	socket.on("lobbyCreated", (data) => {
		console.log("lobby created");
		load("./html/waiting.html");
	});
}
