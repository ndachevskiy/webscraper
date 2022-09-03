const puppeteer = require("puppeteer");
const databaseOps = require("./dbService");
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri, {
  connectTimeoutMS: 30000,
  useUnifiedTopology: true,
});

class ParseService {
  // FUNCTION
  // Opening homepage, setup location, scrolling to the bottom and getting links to all restaurants per particular location
  async getRestaurantLinks(location) {
    // Creating of new browser instance
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    // Assigning of selectors for the home page
    const acceptSelector =
      '[data-localization-key="gdpr-consents.banner.accept-button"]';
    const doneSelector =
      '[data-localization-key="global-address-bar.done-button"]';
    const locationSelector = '[data-test-id="Buttons.UserLocation"]';
    const addressSelector = '[data-test-id="AddressQueryInput"]';

    await page.goto("https://wolt.com/en/discovery/restaurants");
    await page.setViewport({
      width: 1200,
      height: 800,
    });

    // Selecting location
    await page.waitForTimeout(2000);
    await page.waitForSelector(acceptSelector);
    await page.waitForTimeout(2000);
    await page.click(acceptSelector);
    await page.waitForTimeout(2000);
    await page.waitForSelector(locationSelector);
    await page.waitForTimeout(2000);
    await page.click(locationSelector);
    await page.waitForTimeout(2000);
    await page.type(addressSelector, location);
    await page.waitForTimeout(3000);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(2000);
    await page.keyboard.press("\n");
    await page.waitForTimeout(2000);
    await page.click(doneSelector);

    // Scrolling page to the bottom
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // Grabbing links to all restaurants for particular location
    const linksSelector =
      "#mainContent > div > div > div.RenderDiscoveryFormat__SectionWrapper-sc-o3nb6j-1.aLktm > div.VenueVerticalList__Grid-sc-1g9lh7x-1.cgAIgb > a";
    await page.waitForTimeout(1000);
    await page.waitForSelector(linksSelector);
    await page.waitForTimeout(1000);
    const links = await page.$$eval(linksSelector, (e) => e.map((a) => a.href));

    await page.close();
    await browser.close();

    return links;
  }

  // FUNCTION
  // Scrape and parse data
  async scrapeParseAndSave(links) {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const flatLinks = links.flat();

    // Dropping existing collections to sanitize database

    await databaseOps.dropDatabase(client);

    // Iterating over array of restaurant links
    for (let i = 0; i < flatLinks.length; i++) {
      const page = await browser.newPage();
      await page.goto(flatLinks[i]);

      // Constructing of restaurant ID
      const rawData1 = flatLinks[i];
      const rawData2 = rawData1.match(
        /(?:([^\:]*)\:\/\/)?(?:([^\:\@]*)(?:\:([^\@]*))?\@)?(?:([^\/\:]*)\.(?=[^\.\/\:]*\.[^\.\/\:]*))?([^\.\/\:]*)(?:\.([^\/\.\:]*))?(?:\:([0-9]*))?(\/[^\?#]*(?=.*?\/)\/)?([^\?#]*)?(?:\?([^#]*))?(?:#(.*))?/
      );
      const part1 = rawData2[8].split("/")[3];
      const part2 = rawData2[9];
      const dataId = part1 + "-" + part2;

      // Getting restaurant info
      const nameSelector =
        "#venueHeroBanner > div.VenueHeroBanner-module__container___b_JlJ > div:nth-child(1) > h1 > span";
      const addressSelector =
        "#mainContent > div > div.Venue__VenueContent-sc-3kit60-0.kJCkKO > div.Venue-module__container___vJcWL.rtl > div.VenueSideInfo__Root-sc-1bpnd7a-0.fgVEPM.VenueSideInfo-module__venueInformation___GimMp.VenueSideInfo-module__hideOnTablet___fKsjR.rtl > div.VenueSideInfo__Block-sc-1bpnd7a-1.jrwiYF.VenueSideInfo-module__venueAddress___W71Q7 > div.VenueSideInfo-module__primary___xK8qF";
      const phoneSelector =
        "#mainContent > div > div.Venue__VenueContent-sc-3kit60-0.kJCkKO > div.Venue-module__container___vJcWL.rtl > div.VenueSideInfo__Root-sc-1bpnd7a-0.fgVEPM.VenueSideInfo-module__venueInformation___GimMp.VenueSideInfo-module__hideOnTablet___fKsjR.rtl > div:nth-child(4) > div.AllergyInfo-module__allergyInfo___SHNzP > div > a > span";
      const citySelector =
        "#mainContent > div > div.Venue__VenueContent-sc-3kit60-0.kJCkKO > div.Venue-module__container___vJcWL.rtl > div.VenueSideInfo__Root-sc-1bpnd7a-0.fgVEPM.VenueSideInfo-module__venueInformation___GimMp.VenueSideInfo-module__hideOnTablet___fKsjR.rtl > div.VenueSideInfo__Block-sc-1bpnd7a-1.jrwiYF.VenueSideInfo-module__venueAddress___W71Q7 > div.VenueSideInfo-module__secondary___Kuira";

      await page.waitForSelector(nameSelector);
      await page.waitForSelector(addressSelector);
      await page.waitForSelector(phoneSelector);
      await page.waitForSelector(citySelector);

      const name = await page.$eval(nameSelector, (el) => el.innerText);
      const address = await page.$eval(addressSelector, (el) => el.innerText);
      const phone = await page.$eval(phoneSelector, (el) => el.innerText);
      const city = await page.$eval(citySelector, (el) => el.innerText);

      // Check whether category exists
      let category;
      try {
        const data = await page.evaluate(() => {
          const elements = document.getElementsByClassName(
            "TextButtonLink__Root-sc-1wmubx2-0 chwoZo RelatedCategories__StyledLink-sc-j6tz3t-2 GPrMh"
          );
          const result = [];
          for (let i = 0; i < elements.length; i++) {
            result.push(elements[i].innerText);
          }
          return result;
        });

        category = data;
      } catch {
        category = [];
      }

      // Filing restaurant info object
      const restaurantObject = {
        _id: dataId,
        name,
        address,
        phone,
        city: city.match(/[a-zA-Z',.\s-]{1,25}$/g)[0].trim(),
        category,
      };

      // Getting menu and images info

      // Grabbing menu raw data
      await page.waitForTimeout(1000);
      const menuInfo = await page.$$eval("[data-test-id='MenuItem']", (e) => {
        const rawData1 = [];
        e.map((a) => rawData1.push(a.innerText));
        const rawData2 = [];
        rawData1.map((v) => {
          const el = v.split("\n");
          rawData2.push(el);
        });

        return rawData2;
      });

      // Grabbing menu names
      const menuNames = menuInfo.map((v) => {
        return v[0];
      });

      // Grabbing menu prices
      const rawPrices = menuInfo
        .join("")
        .replace(/\s/g, "")
        .match(/CZK\d+(?:[.,]\d{2})/g);

      const menuPrices = rawPrices.map((v) => {
        const data1 = v.split("");
        const data2 =
          data1.slice(0, 3).join("").replace(",", "") +
          " " +
          data1.slice(3).join("").replace(",");
        return data2;
      });

      // Grabbing menu descriptions
      const menuDescriptions = menuInfo.map((v, i) => {
        const data1 = v.slice(1, v.indexOf(menuPrices[i]));
        const data2 = data1.join("").replace(",", "").trim();
        return data2;
      });

      // Grabbing menu images
      const menuImagesRaw = await page.$$eval(
        '[data-test-id="MenuItemContentArea"]',
        (elements) => {
          const rawData = [];
          for (const el of elements) {
            rawData.push(el.innerHTML);
          }

          const links = [];
          rawData.map((v) => {
            if (
              !v.match(
                /(https:\/\/imageproxy.wolt.com\/.*\.(?:png|jpeg|jpg))/gi
              )
            ) {
              links.push("".split(""));
            } else {
              links.push(
                v.match(
                  /(https:\/\/imageproxy.wolt.com\/.*\.(?:png|jpeg|jpg))/gi
                )
              );
            }
          });

          return links;
        }
      );

      const menuImages = menuImagesRaw.map((v) => {
        const data = v.join();
        return data;
      });

      // Constructing resulting menu object
      const menuObjects = [];
      for (let i = 0; i < menuInfo.length; i++) {
        const menuObject = {};
        menuObject.restaurantId = dataId;
        menuObject.name = menuNames[i];
        menuObject.description = menuDescriptions[i];
        menuObject.price = menuPrices[i];
        menuObject.imageUrl = menuImages[i];
        menuObjects.push(menuObject);
      }

      await page.close();

      await databaseOps.saveData(client, restaurantObject, menuObjects);
    }

    await browser.close();

    return;
  }
}

module.exports = new ParseService();
