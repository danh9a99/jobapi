const { url } = require('inspector');
const puppeteer = require ('puppeteer');
let _url = 'https://www.vietnamworks.com/ai+nganh-it-phan-mem-i35-vn';

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
//initiating Puppeteer
puppeteer
  .launch ()
  .then (async browser => {
  
    //opening a new page and navigating to Reddit
    const page = await browser.newPage ();
    await page.goto(_url, {
        waitUntil: 'networkidle0',
      });
    await page.screenshot({ path: 'screenshot.png' })

    await autoScroll(page);
   
    let grabPosts = await page.evaluate (() => {
    let allPosts = document.body.querySelectorAll ('.job-item');
    //storing the post items in an array then selecting for retrieving content
    scrapeItems = [];
    
    allPosts.forEach (item => {  

      let companyJob = '';
      try{
        companyJob = item.querySelector('.row .company-name').getAttribute('title');
      } catch(err){
        companyJob = null;
      }

      let date = '';
      try{
        date = item.querySelector('.posted-date').innerText;
      } catch(err){
        date = null;
      }

      let imgs = '';
      try{
        imgs = item.querySelector('.logo-area-wrapper img[src]').getAttribute('src');
      } catch(err){
        imgs = null;
      }

      let postTitle = '';
      try{
        postTitle =  item.querySelector ('h3').innerText;
      } catch(err){
        postTitle = null;
      }

      let postDescription = '';
        try {
          postDescription = item.querySelector ('.location').innerText;
        } catch (err) {
            postDescription = null; 
        }
        scrapeItems.push ({
          jobTitle: postTitle,
          companyName: companyJob,
          datePost: date,
          jobLocation: postDescription,
          imageJob: imgs
        });
      });

      let items = {
        "vietnamworks": scrapeItems,
      };
      return items;
      
    });
    
    //outputting the scraped data
    console.log (grabPosts);
    //closing the browser
    await browser.close ();
    
  })
  //handling any errors
  .catch (function (err) {
    console.error (err);
  });