function populateLobbies(lobbies) {
	let lobbiesDiv = document.querySelector(".lobbies");
	lobbiesDiv.innerHTML = ""; // Clear existing lobbies
	lobbies.forEach((lobby) => {
		const lobbyElement = document.createElement("div");
		lobbyElement.className = "lobby-element";
		lobbyElement.innerHTML = `<p>Lobby Name: ${lobby.name}\nHosted by: ${lobby.hostName}</p><p>Players: ${lobby.playerCount}</p><button onclick='joinGame("${lobby.id}")'>Join</button>`;
		lobbiesDiv.appendChild(lobbyElement);
	});
}
socket.on("lobbyClose", () => {
	location.reload();
});
