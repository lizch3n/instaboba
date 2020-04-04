const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3100;
const puppeteer = require('puppeteer');

const getPage = function () {
    return new Promise(async function (resolve, reject) {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--proxy-server="direct://"',
                '--proxy-bypass-list=*',
                '--disable-dev-shm-usage',
                '--single-process'
            ]
        });
        const page = await browser.newPage();
        await page.goto('http://www.instagram.com/bobafettcav/', {waitUntil: 'networkidle2'});
        await page.pdf({path: 'hn.pdf', format: 'A4'});
        let selector = '[rel="stylesheet"][href^="/static/bundles"]';
        await page.evaluate((sel) => {
            let body = document.body;
            let newdiv = document.createElement('div');
            newdiv.innerHTML = "<h1>Instagram scraper using puppeteer - <a style='z-index: 2;color: cyan;' href='https://www.instagram.com/bobafettcav/'>@bobafettcav</a></h1>";
            newdiv.setAttribute('style', 'height: 2em;display: block;clear: both;width: 100vw;z-index: 1;font-size: 2em;position: fixed;background: rgba(0,0,0,0.5);color: #fff;line-height: 2em;text-align: center;')
            let sp2 = body.children[0];
            body.insertBefore(newdiv, sp2);
            let elements = document.querySelectorAll(sel);
            for (let i = 0; i < elements.length; i++) {
                elements[i].href = elements[i].href; //seems dumb but it will make absolute urls
            }
            let elements2 = document.querySelectorAll('[href^="/p/"]');
            for (let i = 0; i < elements2.length; i++) {
                elements2[i].href = elements2[i].href; //seems dumb but it will make absolute urls
            }
        }, selector);
        resolve({"content": await page.content(), "browser": browser});
    })

};
app.get('/', function (req, res, next) {
    getPage().then(function (obj) {
        obj.browser.close();
        res.send(obj.content);
    });
});

app.get('/pdf', function (req, res, next) {
    try {
        res.sendFile(__dirname + '/hn.pdf')
    } catch (e) {
    }
});

process.on('uncaughtException', function (err) {
    console.log(err);
});

const server = app.listen(port, function () {
    console.log("Listening on " + port);
});
module.exports = server;