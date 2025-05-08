const totalFrames = 128;
const baseDelay = 10;
const growthFactor = 1.2;
let currentTimeout = null;
let currentFolder = null;
let frame = 1;

function stopAnimating() {
	clearTimeout(currentTimeout);
}

function animate(folder) {
	if (frame > totalFrames) return;
	let image = document.getElementById("animation-image");
	let padded = String(frame).padStart(3, "0");
	image.src = `https://mihior.pro/pogodi-sliku/frames/${currentFolder}/frame_${padded}.svg`;

	const nextDelay = baseDelay * Math.pow(growthFactor, frame);
	frame++;

	currentTimeout = setTimeout(loadNextFrame, nextDelay);
}
