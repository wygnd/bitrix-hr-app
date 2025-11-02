document.addEventListener('DOMContentLoaded', async () => {
    try {
        let BX24 = await B24Js.initializeB24Frame();

        const placementInfo = BX24.placement.info();

        console.log(placementInfo);
    } catch (error) {
        document.querySelector('#app').remove();
    }
});