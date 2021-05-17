describe('writeForDocumentReady', () => {
    it('write for document ready', async () => {
        await Utils.waitForDocumentReady();
        const demo = document.getElementById('content');
        const html = demo && demo.innerHTML;
        assert(html, 'dom ready');
    })
})
