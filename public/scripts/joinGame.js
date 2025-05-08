function joinViaID() {
	const ime = localStorage.getItem("TRIP_ime");
	const prezime = localStorage.getItem("TRIP_prezime");
	const id = document.getElementById("join-via-id").value;
	if (id) {
		console.log({ ime, prezime, pin: id });
		socket.emit("join", { ime, prezime, pin: id });
	}
}

socket.on("joined", () => {
	load("./html/waiting.html");
});
