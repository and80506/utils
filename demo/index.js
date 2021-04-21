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
Utils.safeTimeout(() => {
    console.log('console at 100ms');
}, 700);
Utils.cycle((i) => {
    if (Math.random() > 0.1) {
        throw new Error('error occur when random more than 0.1');
    }
    console.log('success cycle', i);
});
Utils.popup('9999');