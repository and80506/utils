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
    console.log('safeTimeout console at 100ms');
}, 700);
// 重试多次直到错误时停止
Utils.cycle((i) => {
    if (Math.random() > 0.01) {
        throw new Error('error occur when random more than 0.9');
    }
    console.log('success cycle times:', i);
}).then((result) => {
    console.log('suc', result);
}).catch((err) => {
    console.log(err)
});