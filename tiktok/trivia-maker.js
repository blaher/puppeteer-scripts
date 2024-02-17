const openai = require('openai');

const config = require('./config.js');

const oai = new openai({
    apiKey: config.chatgptKey,
});
const puppeteer = require('puppeteer');

function delay(time) {
   return new Promise(function(resolve) {
       setTimeout(resolve, time)
   });
}

async function ask(question) {
    console.log(question + ":\n\n");

    var response = '';
    const stream = await oai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: question }],
        stream: true,
    });
    for await (const chunk of stream) {
        const partial = (chunk.choices[0]?.delta?.content || "");
        response += partial;
        process.stdout.write(partial);
    }

    console.log("\n\n---------------------------------\n\n");

    return response;
}

async function background(subject) {
    console.log("Background for: " + subject + "\n\n");

    const response = await oai.images.generate({
        model: "dall-e-3",
        prompt: "background for " + subject,
        n: 1,
        size: "1024x1792",
        quality: "standard",
    });
    console.log("URL: " + response.data[0].url);

    console.log("\n\n---------------------------------\n\n");

    return response.data[0].url;
}

(async () => {
    console.log("Generating Trivia Questions...\n");

    const category = await ask("Generate a random trivia category");
    var questions = [];
    var images = [];

    // loop 10 times
    for (let i = 0; i < 10; i++) {
        console.log("Question #" + (i + 1) + ":\n\n");

        const question = await ask("Create a multiple choice trivia question with selected answer in abcd format in the theme of " + category);
        await delay(5000);
        const subject = await ask("What are the nouns of the question \"" + question + "\"?");
        await delay(5000);
        const image = await background(subject);
        await delay(10000);

        questions.push(question);
        images.push(image);
    }

    console.log("\nGenerating Trivia Questions Complete!\n");

    console.log("Questions:\n\n");
    console.log(questions.join("\n\n"));

    console.log("\nImages:\n\n");
    console.log(images.join("\n\n"));

    console.log("\n\n---------------------------------\n\n");

    return;

  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  //page.setDefaultTimeout(0);

  // Navigate the page to a URL
  await page.goto('https://chat.openai.com/auth/login');
  await page.waitForSelector('button[data-testid="login-button"]');
  await page.click('button[data-testid="login-button"]');

  await page.waitForSelector('input[name="username"]');
  await page.waitForSelector('form:has(input[name="username"]) button[type="submit"]');
  await delay(5000);
  await page.type('input[name="username"]', config.chatgptUser);
  await delay(5000);
  await page.click('form:has(input[name="username"]) button[type="submit"]');
  await delay(5000);

  await page.waitForSelector('input[name="password"]');
  await page.waitForSelector('form:has(input[name="password"]) button[type="submit"]');
  await delay(5000);
  await page.type('input[name="password"]', config.chatgptPass);
  await delay(5000);
  await page.click('form:has(input[name="password"]) button[type="submit"]');
  await delay(5000);

  await page.waitForSelector('#prompt-textarea');
  await delay(5000);
/*
  console.log('Last Posts:')
  var users = require('./following.js');
  var old_users = [];
  var private_users = [];

  const safelist = new Set(require('./safelist.js'));
  users = users.filter( x => !safelist.has(x) );

  for (user of users) {
    await page.goto('http://instagram.com/'+user);

    const searchResultSelector = 'main article a';
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

  await browser.close();*/
})();
