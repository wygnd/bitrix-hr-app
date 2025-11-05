document.addEventListener('DOMContentLoaded', async () => {
	try {
		let BX24 = await B24Js.initializeB24Frame();
		
		console.log(123);
		
	} catch(error) {
		// document.querySelector('#app').remove();
	}
});