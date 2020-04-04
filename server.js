const express = require('express');
const fs = require('fs');
const app = express();
const axios = require('axios');
const port = process.env.PORT || 3100;
const puppeteer = require('puppeteer');

(async () => {
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
    await page.goto('https://news.ycombinator.com', {waitUntil: 'networkidle2'});
    await page.pdf({path: 'hn.pdf', format: 'A4'});

    await browser.close();
})();

const getPage = function(){
    return new Promise(async function(resolve, reject){
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('http://www.instagram.com/bobafettcav/', {waitUntil: 'networkidle2'});
        // await page.pdf({path: 'hn.pdf', format: 'A4'});
        resolve({"content":await page.content(),"browser":browser});
        // await browser.close();
    })

};
app.get('/', function(req,res,next){
    getPage().then(function(obj){
        obj.browser.close();
        res.send(obj.content);
    });
});

process.on('uncaughtException', function (err) {
    console.log(err);
});

const server = app.listen(port, function() {
    console.log("Listening on " + port);
});
module.exports = server;