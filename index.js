const express = require("express");
const http = require("http");
const PORT = 3000;
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let lobbies = [
	{
		id: "test123",
		name: "Test Lobby",
		hostName: "Test Host",
		hostSocket: null,
		players: [
			{
				ime: "Test",
				prezime: "Player",
				socket: null,
			},
		],
	},
];

app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/public/index.html");
});

// Handle socket.io connections
io.on("connection", (socket) => {
	socket.on("disconnect", () => {
		const lobby = lobbies.find((lobby) => lobby.hostSocket === socket);
		if (lobby) {
			console.log(
				`Lobby "${lobby.name}" hosted by "${lobby.hostName}" has been removed.`
			);
			lobby.players.forEach((player) => {
				player.socket.emit("lobbyClose", lobby.id);
			});
		}
		lobbies = lobbies.filter((lobby) => lobby.hostSocket !== socket);
	});

	socket.on("create", (msg) => {
		const existingLobby = lobbies.find((lobby) =>
			lobby.players.some((player) => player.socket === socket)
		);

		if (existingLobby) {
			socket.emit("error", "You are already in another lobby.");
			return;
		}
		lobbies.push({
			id: Math.random().toString(36).substr(2, 9),
			name: randomLobbyName(),
			hostName: `${msg.ime} ${msg.prezime}`,
			hostSocket: socket,
			players: [
				{
					ime: msg.ime,
					prezime: msg.prezime,
					socket: socket,
				},
			],
		});
		socket.emit("lobbyCreated", {
			id: lobbies[lobbies.length - 1].id,
			name: lobbies[lobbies.length - 1].name,
		});
	});

	socket.on("join", (msg) => {
		const lobby = lobbies.find((lobby) => lobby.id === msg.lobbyId);

		if (!lobby) {
			socket.emit("error", "Lobby not found.");
			return;
		}

		const isAlreadyInLobby = lobby.players.some(
			(player) => player.socket === socket
		);

		if (isAlreadyInLobby) {
			socket.emit("error", "You are already in this lobby.");
			return;
		}

		lobby.players.push({
			ime: msg.ime,
			prezime: msg.prezime,
			socket: socket,
		});

		socket.emit("joined", { lobbyId: lobby.id, lobbyName: lobby.name });
		lobby.hostSocket.emit("playerJoined", {
			ime: msg.ime,
			prezime: msg.prezime,
		});
	});

	socket.on("getLobbies", () => {
		socket.emit(
			"lobbiesList",
			lobbies.map((lobby) => ({
				id: lobby.id,
				name: lobby.name,
				hostName: lobby.hostName,
				playerCount: lobby.players.length,
			}))
		);
	});
});

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

function randomLobbyName() {
	const adjectives = [
		"Quick",
		"Lazy",
		"Happy",
		"Brave",
		"Clever",
		"Bold",
		"Bright",
		"Calm",
		"Eager",
		"Gentle",
		"Kind",
		"Loyal",
		"Noble",
		"Proud",
		"Sharp",
		"Witty",
	];
	const animals = [
		"Fox",
		"Bear",
		"Eagle",
		"Tiger",
		"Wolf",
		"Lion",
		"Panther",
		"Hawk",
		"Falcon",
		"Leopard",
		"Otter",
		"Rabbit",
		"Deer",
		"Owl",
		"Dolphin",
		"Shark",
	];
	const randomAdjective =
		adjectives[Math.floor(Math.random() * adjectives.length)];
	const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
	return `${randomAdjective} ${randomAnimal}`;
}
