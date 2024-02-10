const fs = require('fs');
const puppeteer = require('puppeteer');
const mustache = require('mustache');

const printSantriWithdrawal = async (data) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlBody = fs.readFileSync('./src/tmp/withdraw-santri.html', 'utf-8');

  const pageHeight = await page.evaluate(() => {
    return document.body.scrollHeight;
  });


  await page.setContent(mustache.render(htmlBody, data));
  const pdf = await page.pdf({ width: '8cm', height: `${pageHeight}px` });
  fs.writeFileSync(`./src/tmp/${data.nomor}.pdf`, pdf);

  page.close();
  browser.close();
}

const printTopupHistory = async (data) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlBody = fs.readFileSync('./src/tmp/topup.html', 'utf-8');

  const pageHeight = await page.evaluate(() => {
    return document.body.scrollHeight;
  });


  await page.setContent(mustache.render(htmlBody, data));
  const pdf = await page.pdf({ width: '8cm', height: `${pageHeight}px` });
  fs.writeFileSync(`./src/tmp/${data.nomor}.pdf`, pdf);

  page.close();
  browser.close();
}

const printVendorHistory = async (data) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlBody = fs.readFileSync('./src/tmp/vendor.html', 'utf-8');

  const pageHeight = await page.evaluate(() => {
    return document.body.scrollHeight;
  });


  await page.setContent(mustache.render(htmlBody, data));
  const pdf = await page.pdf({ width: '8cm', height: `${pageHeight}px` });
  fs.writeFileSync(`./src/tmp/${data.nomor}.pdf`, pdf);

  page.close();
  browser.close();
}

const printPurchaseHistory = async (data) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlBody = fs.readFileSync('./src/tmp/purchase.html', 'utf-8');

  const pageHeight = await page.evaluate(() => {
    return document.body.scrollHeight;
  });


  await page.setContent(mustache.render(htmlBody, data));
  const pdf = await page.pdf({ width: '8cm', height: `${pageHeight}px` });
  fs.writeFileSync(`./src/tmp/${data.nomor}.pdf`, pdf);

  page.close();
  browser.close();
}

const printTransferHistory = async (data) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlBody = fs.readFileSync('./src/tmp/transfer.html', 'utf-8');

  const pageHeight = await page.evaluate(() => {
    return document.body.scrollHeight;
  });


  await page.setContent(mustache.render(htmlBody, data));
  const pdf = await page.pdf({ width: '8cm', height: `${pageHeight}px` });
  fs.writeFileSync(`./src/tmp/${data.nomor}.pdf`, pdf);

  page.close();
  browser.close();
}

const printProduct = async (data) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlBody = fs.readFileSync('./src/tmp/product.html', 'utf-8');

  const pageHeight = await page.evaluate(() => {
    return document.body.scrollHeight;
  });


  await page.setContent(mustache.render(htmlBody, data));
  const pdf = await page.pdf({ width: '8cm', height: `${pageHeight}px` });
  fs.writeFileSync(`./src/tmp/${data.nomor}.pdf`, pdf);

  page.close();
  browser.close();
}

module.exports = {
  printSantriWithdrawal,
  printTopupHistory,
  printVendorHistory,
  printPurchaseHistory,
  printTransferHistory,
  printProduct
}