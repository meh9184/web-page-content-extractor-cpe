

(async function() {
    page.setViewport({width: 1000, height: 600, deviceScaleFactor: 2});

    await page.goto('https://www.chromestatus.com/samples', {waitUntil: 'networkidle'});

    async function screenshotDOMElement(selector, padding = 0) {
        const rect = await page.evaluate(selector => {
            const element = document.querySelector(selector);
            const {x, y, width, height} = element.getBoundingClientRect();
            return {left: x, top: y, width, height, id: element.id};
        }, selector);

        return await page.screenshot({
            path: 'element.png',
            clip: {
                x: rect.left - padding,
                y: rect.top - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2
            }
        });
    }

    await screenshotDOMElement('header aside', 16);

})();