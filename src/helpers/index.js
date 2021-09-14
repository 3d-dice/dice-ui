export async function loadHTML(htmlRelativeUrl, baseUrl) {
	const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
	const response = await fetch(htmlUrl).then(response => response.text())
	return response
}

export async function loadCSS(htmlRelativeUrl, baseUrl, id) {
	const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
	const link = document.createElement("link");
	link.href = htmlUrl
	link.type = "text/css"
	link.rel = "stylesheet"
	link.media = "screen"
	// link.rel = "preload"
	// link.as = "style"
	if(id){
		link.id = id
	}
	document.getElementsByTagName("head")[0].appendChild(link);
}