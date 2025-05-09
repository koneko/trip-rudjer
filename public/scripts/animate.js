const totalFrames = 128;
const baseDelay = 10;
const growthFactor = 1.2;
let currentTimeout = null;
let frame = 1;

function stopAnimating() {
	frame = 1;
	clearTimeout(currentTimeout);
}

function animate(folder) {
	if (frame > totalFrames) return;
	let d = document.querySelector(".animation");
	let padded = String(frame).padStart(3, "0");
	d.innerHTML = `<img width="600" height="600" src="https://mihior.pro/pogodi-sliku/frames/${folder}/frame_${padded}.svg" id="animation-image" />`;
	console.log(frame);

	const nextDelay = baseDelay * Math.pow(growthFactor, frame);
	frame++;

	currentTimeout = setTimeout(() => {
		animate(folder);
	}, nextDelay);
}
