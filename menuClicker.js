const puppeteer = require('puppeteer');

const url = 'http://socio-info.hanyang.ac.kr/wordpress/people/';

const resolX = 1280;
const resolY = 1024;
const delay = 2000;

//(async function () {
(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setViewport({width: resolX, height: resolY, deviceScaleFactor: 1});
    await page.goto(url, {waitUntil: 'networkidle2'});

    //get menu
    await page.waitForSelector('#menu-home a');

    //get currentURL
    let currentUrl = await page.evaluate(() => window.location.href);
    console.log("[CURRENT URL]: ", currentUrl);

    const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('#menu-home > li > a'));

        //return anchors.map(anchor => [anchor.textContent, anchor.clientWidth, anchor.clientHeight, anchor.offsetLeft, anchor.offsetTop]);
        return anchors.map(function (element) {
            var text = element.textContent;
            var top = 0, left = 0;
            do {
                top += element.offsetTop || 0;
                left += element.offsetLeft || 0;
                element = element.offsetParent;
            } while (element);

            return {
                top: top,
                left: left,
                text: text
            };
        });
    });

    for (var i in links) {
        console.log("[index ", i, "]", links[i]);
    }

    //await page.click('#menu-home > li > a:first-child')

    // 메뉴 라인 훑기
    for (var i = links[0].left; i < resolX; i += 100) {
        console.log("CLICK POS", i, links[0].top+3);
        await page.mouse.click(i, links[0].top+3);
        await page.waitFor(delay);
    }

    // await page.mouse.click(800, 273);
    // await page.waitFor(2000);

    //get currentURL
    currentUrl = await page.evaluate(() => window.location.href);
    console.log("[CURRENT URL]: ", currentUrl);

    console.log("WORK FINISHED");
    await browser.disconnect();
    //await browser.close();
})();