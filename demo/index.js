function getDemoHtml() {
    const demo = document.getElementById('demo');
    const html = demo && demo.innerHTML;
    console.log(`get html: ${html}`);
}
console.log('document is loading')
getDemoHtml();
Utils.waitForDocumentReady().then(function() {
    console.log('document is complete')
    getDemoHtml();
});
Utils.waitForDocumentBody().then(function(body) {
    console.log('body is complete')
    console.log(body)
});