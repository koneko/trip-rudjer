const express = require("express");
const http = require("http");
const PORT = 3000;
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const allFolders = [
	"frames_amongus",
	"frames_babyyoda",
	"frames_cat01",
	"frames_cat02",
	"frames_cat03",
	"frames_cat04",
	"frames_cat05",
	"frames_cat06",
	"frames_creeper",
	"frames_darthvader",
	"frames_eiffeltower",
	"frames_hellokitty",
	"frames_homersimpson",
	"frames_hulk",
	"frames_ironman",
	"frames_monalisa",
	"frames_nyancat",
	"frames_pepe",
	"frames_pikachu",
	"frames_rickroll",
	"frames_shiba",
	"frames_spiderman",
	"frames_spongebob",
	"frames_spooderman",
	"frames_statueofliberty",
	"frames_supermario",
	"frames_windowsxphill",
];

let lobby = {
	hostSocket: null,
	pin: null,
	connectedPlayers: [],
	state: {
		folder: null,
	},
};

app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/public/index.html");
});

// Handle socket.io connections
io.on("connection", (socket) => {
	socket.on("disconnect", () => {
		if (lobby.hostSocket === socket) {
			lobby.hostSocket = null;
			lobby.pin = null;
			lobby.connectedPlayers.forEach((player) => {
				player.socket.emit("lobbyClose");
			});
			lobby.connectedPlayers = [];
			console.log("Host disconnected. Lobby cleared.");
		} else {
			let player = lobby.connectedPlayers.find(
				(player) => player.socket == socket
			);
			if (!player) return;
			lobby.hostSocket.emit(
				"playerDisconnect",
				`${player.ime} ${player.prezime}`
			);
			// If a player disconnects, remove them from the connected players
			lobby.connectedPlayers = lobby.connectedPlayers.filter(
				(player) => player.socket !== socket
			);
		}
	});

	socket.on("create", (msg) => {
		if (msg != "abcdefgh")
			return socket.emit("error", "403 Not authorized.");
		lobby.hostSocket = socket;
		lobby.pin = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit PIN
		lobby.connectedPlayers = [];
		socket.emit("createdLobby", lobby.pin);
	});

	socket.on("join", (msg) => {
		console.log(msg.pin, lobby.pin);
		if (msg.pin != lobby.pin) {
			return socket.emit("error", "Invalid PIN.");
		}
		socket.emit("joined");
		lobby.connectedPlayers.push({
			socket: socket,
			ime: msg.ime,
			prezime: msg.prezime,
		});
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
