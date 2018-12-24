const puppeteer = require('puppeteer');
const xlsx = require('xlsx');

const resolX = 1280;
const resolY = 1024;
const delay = 1500;

const getPageInformationFromDataSet = (pageNumber) =>{
    let workbook = xlsx.readFile('DataSet.xlsx');
    let worksheet = workbook.Sheets[workbook.SheetNames[1]];

    let pageInformation = {};
    pageInformation.pageNumer = pageNumber;
    pageInformation.site = worksheet[`B${5+pageNumber}`].v;
    pageInformation.siteDesc = worksheet[`C${5+pageNumber}`].v;
    pageInformation.url = worksheet[`D${5+pageNumber}`].v;
    pageInformation.numberOfMenu = worksheet[`G${5+pageNumber}`].v;
    pageInformation.menuXpathList = worksheet[`F${5+pageNumber}`].v.split(', ');
    pageInformation.answerXpath = worksheet[`H${5+pageNumber}`].v;

    // console.log(pageInformation);
    return pageInformation;
}

const helperFunctions = () => {
    window.getMenuElements = (menuXpathList) => {
        let menuElements = [];

        for(let i=0; i<menuXpathList.length; i++)
            menuElements.push(getElementByXpath(menuXpathList[i]));

        return menuElements;
    }
    window.getMenuPath = (menuElements) => {
        let menuPath = [];
        for(let i=0; i<menuElements.length; i++) {
            let temp = menuElements[i];
            while (temp.tagName !== 'BODY') {
                menuPath.push(temp);
                temp = temp.parentNode;
            }
            menuPath.push(temp);
        }
        return menuPath;
    }
    window.getCenterElement = (resolX, resolY) => {
        return document.elementFromPoint(resolX / 2, resolY / 2);
    }
    window.getMainContentElement = (centerElement, menuPath) => {
        let previous;
        let current = centerElement;
        Array.prototype.isContain = function(element) {
            for(let i = 0; i < this.length; i++)
                if(this[i] == element)
                    return true;
            return false;
        }
        while(!menuPath.isContain(current)){
            previous = current;
            current = current.parentNode;
        }
        let mainContentElement = previous;
        return mainContentElement;
    }
    window.getElementByXpath = (xPath) => {
        return document.evaluate(
            xPath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
    }
    window.highlightElement = (element, color) => {
        element.style.borderStyle = 'solid';
        element.style.borderWidth = '5px';
        element.style.borderColor = color;
    }
    window.highlightElements = (elements, color) => {
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.borderStyle = 'solid';
            elements[i].style.borderWidth = '5px';
            elements[i].style.borderColor = color;
        }
    }
    window.sendInformationToServerUsingJquery = (formData) =>{
        // jquery 이용하여 ajax 전송
        $.ajax({
            type: "POST",
            url: "http://localhost:8000/testMainContentXpath",
            data: formData,
            processData: false,
            contentType: false
        }).fail(function () {
            console.log('POST 실패!!');
        }).done(function (data, status, xhr) {
            console.log('POST 성공!!');
        });

    }
    window.sendInformationToServerUsingXHR = (formData) =>{
        // Xml Http Request 객체 이용하여 ajax 전송
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status === 200 || xhr.status === 201) {
                console.log(xhr.responseText);
            } else {
                console.error(xhr.responseText);
            }
        };
        xhr.open('POST', 'http://localhost:8000/testMainContentXpath');
        xhr.send(formData);
    }
}

async function runCenterPointExpansion() {
    // browser, page 객체 생성 및 view 크기 configuration
    const browser = await puppeteer.launch({headless: false});

    // 50개 page 돌면서 mainContentElement 찾고 스크린샷 저장
    for(let i = 21; i <= 21; i++) {
        try {
            // DataSet.xlsx 파일로부터 i번째 pageInformation 추출
            let pageInformation = await getPageInformationFromDataSet(i);

            // 접근할 수 없는 page 면 점프
            if (pageInformation.url === 'X') {
                console.log("[WORK JUMP]: ", `PAGE ${i}`);
                continue;
            }

            // page 객체 만들어 해당 url 로 이동
            let page = await browser.newPage();
            await page.setViewport({width: resolX, height: resolY, deviceScaleFactor: 1});
            await page.goto(pageInformation.url, {waitUntil: 'networkidle2'});
            // await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'});

            // helperFunctions 스코프에 있는 전역 함수들 exposing
            await page.evaluate(helperFunctions);

            // [WORK START]
            console.log("[WORK START]: ", `PAGE ${i}`);
            await page.waitFor(delay);

            // 현재 page 에서 menuElements, centerElement, mainContentElement 를 각각 red, blue, yellow 로 표시
            await page.evaluate(async ({resolX, resolY, pageInformation}) => {
                // 1. 모든 menuElement 를 추출하고, 빨간색으로 칠한다.
                let menuElements = await getMenuElements(pageInformation.menuXpathList);
                await highlightElements(menuElements, 'red');
                console.log('1. [menuElements]');
                console.log(menuElements);

                // 2. 각각의 메뉴부터 body 까지 이르는 Element 들을 menuPath 에 기록한다.
                let menuPath = await getMenuPath(menuElements);
                console.log('2. [menuPath]');
                console.log(menuPath);

                // 3. Web Page 의 중심에 해당되는 centerElement 를 찾고, 파란색으로 칠한다.
                let centerElement = await getCenterElement(resolX, resolY);
                await highlightElement(centerElement, 'blue');
                console.log('3. [centerElement]');
                console.log(centerElement);

                // 4. centerElement 를 menuPath 에 닿을때까지 확장하여 mainContentElement 를 찾고 노란색으로 칠한다.
                let mainContentElement = await getMainContentElement(centerElement, menuPath);
                await highlightElement(mainContentElement, 'yellow');
                console.log('4. [mainContentElement]');
                console.log(mainContentElement);

                // 5. 미리 저장돼있던 answerXpath 로 부터 answerElement 뽑는다.
                let answerElement = getElementByXpath(pageInformation.answerXpath);
                console.log('5. [answerElement]');
                console.log(answerElement);

                let formData = new FormData();
                formData.append('predict', mainContentElement.outerHTML);
                formData.append('answer', answerElement.outerHTML);
                formData.append('pageNumber', pageInformation.pageNumer);
                formData.append('site', pageInformation.site);
                formData.append('siteDesc', pageInformation.siteDesc);

                sendInformationToServerUsingXHR(formData);


            }, {resolX, resolY, pageInformation});

            // 스크린샷 생성
            // await page.screenshot({path: `./screenshot/page${i}.png`, fullPage: true});

            // page 객체 closing
            // await page.close();

            // [WORK FINISH]
            console.log("[WORK FINISH]: ", `PAGE ${i}`);
            await page.waitFor(delay);

        }catch(e){
            // [ERROR TERMINATE]
            console.log("[ERROR OCCURRED]: ", `PAGE ${i}`);
        }
    }

    await browser.disconnect();
}

module.exports = {
    runCenterPointExpansion: runCenterPointExpansion
};