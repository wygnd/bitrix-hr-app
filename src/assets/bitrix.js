document.addEventListener('DOMContentLoaded', async () => {
    console.log(123);
    try {
        let BX24 = await B24Js.initializeB24Frame();


    } catch (error) {
        console.log('Forbidden');
        document.querySelector('#app').remove();
    }
});