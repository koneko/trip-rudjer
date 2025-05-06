function setname() {
	const ime = document.getElementById("ime").value;
	const prezime = document.getElementById("prezime").value;

	if (ime && prezime) {
		localStorage.setItem("TRIP_ime", ime);
		localStorage.setItem("TRIP_prezime", prezime);
		location.reload();
	} else {
		alert("Please fill in both fields.");
	}
}

function reset() {
	localStorage.removeItem("TRIP_ime");
	localStorage.removeItem("TRIP_prezime");
}
