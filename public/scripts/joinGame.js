function joinGame(id) {
	const ime = localStorage.getItem("TRIP_ime");
	const prezime = localStorage.getItem("TRIP_prezime");
	socket.emit("join", { ime, prezime, lobbyId: id });
}

function joinViaID() {
	const id = document.getElementById("join-via-id").value;
	if (id) {
		socket.emit("join", { ime, prezime, lobbyId: id });
	}
}

socket.on("joined", (msg) => {
	load("./html/waiting.html");
});
