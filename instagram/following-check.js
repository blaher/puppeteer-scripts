const puppeteer = require('puppeteer');

function delay(time) {
   return new Promise(function(resolve) {
       setTimeout(resolve, time)
   });
}

(async () => {

  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  //page.setDefaultTimeout(0);

  const config = require('./config.js');

  // Navigate the page to a URL
  await page.goto('http://instagram.com/accounts/login');
  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', config.user);
  await page.type('input[name="password"]', config.pass);
  await page.click('button[type="submit"]');
  //await page.waitForSelector('._ac8f');
  await delay(10000);

  console.log('Last Posts:')
  var users = require('./following.js');
  var old_users = [];
  var private_users = [];

  const safelist = new Set(require('./safelist.js'));
  users = users.filter( x => !safelist.has(x) );

  for (user of users) {
    await page.goto('http://instagram.com/'+user);

    const searchResultSelector = 'a.x9f619';
    try {
      await page.waitForSelector(searchResultSelector);
      await delay(2000);
      await page.click(searchResultSelector);

      const textSelector = await page.waitForSelector('time');
      await delay(2000);
      const fullTitle = await textSelector?.evaluate(el => el.textContent);

      var css = '';
      if (parseInt(fullTitle) > 52) {
        console.warn('\x1b[31m '+user+': '+fullTitle+' \x1b[0m');
        old_users.push(user);
      } else if (parseInt(fullTitle) > 26) {
        console.warn('\x1b[33m '+user+': '+fullTitle+' \x1b[0m');
        old_users.push(user);
      } else {
        console.log(' '+user+': '+fullTitle);
      }
    } catch (e) {
      console.warn('\x1b[31m '+user+': Private Account \x1b[0m');
      private_users.push(user);
    }
  }

  console.warn("\n\nPrivate users to check: "+old_users.toString());
  console.warn("\nInactive users to check: "+old_users.toString());

  await browser.close();
})();
