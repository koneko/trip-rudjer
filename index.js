const express = require("express");
const http = require("http");
const PORT = 3000;
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const TRIP_ADMIN = "abcdefgh";

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
		guesses: [],
		timeLeftInSeconds: 30,
		round: 1,
	},
};

let interval = null;

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
		if (msg != TRIP_ADMIN)
			return socket.emit("error", "403 Not authorized.");
		lobby.hostSocket = socket;
		lobby.pin = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit PIN
		lobby.connectedPlayers = [];
		lobby.state = {
			folder: null,
			guesses: [],
			timeLeftInSeconds: 30,
			round: 1,
		};
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
			points: 0,
			guesses: [],
		});
		lobby.hostSocket.emit("playerJoined", {
			ime: msg.ime,
			prezime: msg.prezime,
		});
	});

	socket.on("playerGuess", (msg) => {
		const player = lobby.connectedPlayers.find(
			(player) => player.socket === socket
		);
		if (!player) {
			socket.emit("error", "You are not part of the game.");
			return;
		}
		if (msg == "correct") {
			player.points += 10; // Award points for a correct guess
			socket.emit("correctGuess", player.points);
			lobby.hostSocket.emit("playerCorrectGuess", {
				ime: player.ime,
				prezime: player.prezime,
				points: player.points,
			});
		} else {
			socket.emit("incorrectGuess");
			lobby.hostSocket.emit("playerIncorrectGuess", {
				ime: player.ime,
				prezime: player.prezime,
				guess: msg,
			});
		}
		player.guesses.push(msg);
		// Check if all players have guessed
		const allPlayersGuessed = lobby.connectedPlayers.every(
			(player) => player.points > 0 || lobby.state.guesses.includes(msg)
		);

		if (allPlayersGuessed) {
			lobby.state.timeLeftInSeconds = 0;
		}
	});

	socket.on("startGame", (msg) => {
		if (msg != TRIP_ADMIN)
			return socket.emit("error", "403 Not authorized.");
		const randomIndex = Math.floor(Math.random() * allFolders.length);
		lobby.state.folder = allFolders[randomIndex];
		lobby.state.guesses = [];
		while (lobby.state.guesses.length < 3) {
			const randomGuessIndex = Math.floor(
				Math.random() * allFolders.length
			);
			const randomGuess = allFolders[randomGuessIndex];
			if (
				randomGuess !== lobby.state.folder &&
				!lobby.state.guesses.includes(randomGuess)
			) {
				lobby.state.guesses.push(randomGuess);
			}
		}
		lobby.hostSocket.emit("startGame", {
			image: lobby.state.folder,
			guesses: lobby.state.guesses,
		});
		lobby.connectedPlayers.forEach((player) => {
			player.socket.emit("startGame", {
				image: lobby.state.folder,
				guesses: lobby.state.guesses,
			});
		});
		// Start a timer that runs every 30 seconds
		interval = setInterval(() => {
			if (lobby.state.timeLeftInSeconds > 0) {
				lobby.state.timeLeftInSeconds -= 1;
				lobby.hostSocket.emit(
					"updateTime",
					lobby.state.timeLeftInSeconds
				);
				lobby.connectedPlayers.forEach((player) => {
					player.socket.emit(
						"updateTime",
						lobby.state.timeLeftInSeconds
					);
				});
			} else {
				// Time is up, notify players and reset the game state
				lobby.hostSocket.emit("timeUp");
				lobby.connectedPlayers.forEach((player) => {
					player.socket.emit("timeUp");
				});
				lobby.state.timeLeftInSeconds = 30; // Reset timer
				if (!lobby.state.round) {
					lobby.state.round = 1;
				} else {
					lobby.state.round += 1;
				}

				if (lobby.state.round > 5) {
					// End the game after 5 rounds
					lobby.hostSocket.emit("gameOver");
					lobby.connectedPlayers.forEach((player) => {
						player.socket.emit("gameOver");
					});
					lobby.state.rounds = 0; // Reset rounds
					return;
				}

				const nextRandomIndex = Math.floor(
					Math.random() * allFolders.length
				);
				lobby.state.folder = allFolders[nextRandomIndex];
				lobby.state.guesses = [];
				while (lobby.state.guesses.length < 3) {
					const randomGuessIndex = Math.floor(
						Math.random() * allFolders.length
					);
					const randomGuess = allFolders[randomGuessIndex];
					if (
						randomGuess !== lobby.state.folder &&
						!lobby.state.guesses.includes(randomGuess)
					) {
						lobby.state.guesses.push(randomGuess);
					}
				}
				lobby.hostSocket.emit("nextRound", {
					image: lobby.state.folder,
					guesses: lobby.state.guesses,
				});
				lobby.connectedPlayers.forEach((player) => {
					player.socket.emit("nextRound", {
						image: lobby.state.folder,
						guesses: lobby.state.guesses,
					});
				});
			}
		}, 1000);
	});

	socket.on("getGameState", () => {
		if (!lobby.state.folder) {
			socket.emit("error", "No game is currently ongoing.");
			return;
		}
		socket.emit("gameState", {
			lobby: {
				pin: lobby.pin,
				connectedPlayers: lobby.connectedPlayers.map((player) => ({
					ime: player.ime,
					prezime: player.prezime,
					points: player.points,
				})),
				state: {
					folder: lobby.state.folder,
					guesses: lobby.state.guesses,
					timeLeftInSeconds: lobby.state.timeLeftInSeconds,
					round: lobby.state.round,
				},
			},
		});
	});
});

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
