async function load(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.statusText}`);
		}
		const html = await response.text();
		document.body.className = url.split("/")[2].replace(".html", "");
		document.body.innerHTML = html;
	} catch (error) {
		console.error("Error loading HTML:", error);
	}
}
