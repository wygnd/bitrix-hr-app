document.addEventListener('DOMContentLoaded', async () => {
	try {
		let BX24 = await B24Js.initializeB24Frame();
		
		await BX24.call('im.message.add', {
			DIALOG_ID: "376",
			MESSAGE: "Tets message",
		});
		
	} catch(error) {
		document.querySelector('#app').remove();
	}
});