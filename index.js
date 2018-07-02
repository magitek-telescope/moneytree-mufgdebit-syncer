const delay = require("delay");
const puppeteer = require("puppeteer");

const {
  MONEYTREE_TOKEN,
  MONEYTREE_APIKEY,
  MUFG_ID,
  MUFG_PASSWORD,
  TARGET_MONTH
} = process.env;

let result = [["ID", "用途", "金額", "日付"]];

async function scrapingFromMUFG() {
  const browser = await puppeteer.launch({ headless: false });
  let pages, page, isEnded;

  page = await browser.newPage();
  await page.goto(
    "https://entry11.bk.mufg.jp/ibg/dfw/APLIN/loginib/login?_TRANID=AA000_001"
  );
  await delay(150);
  await page.type("#account_id", MUFG_ID);
  await page.type("#ib_password", MUFG_PASSWORD);
  await delay(150);
  await page.click(".acenter.admb_m > a");
  await page.waitForNavigation();
  await page.click("#list > li:nth-child(10)");
  await page.waitForNavigation();
  await delay(300);
  await page.click('[alt="VISAデビット会員用Webにログインする"]');
  await delay(2000);

  pages = await browser.pages();
  page = pages[pages.length - 1];
  await page.click(".nav-02 a");
  await page.waitForNavigation();
  await delay(500);
  await page.select('[name="W031301.referenceDate"]', TARGET_MONTH);
  await delay(1000);

  while (!isEnded) {
    result.push(
      ...(await page.evaluate(async () => {
        let cols = [];
        document.querySelectorAll(".lyt-sp-none .tbl-02 tbody").forEach(col => {
          cols.push(
            [
              `VISA-${col.querySelector("td:nth-of-type(9)").innerHTML}`,
              `${col.querySelector("td:nth-of-type(2)").innerHTML}`,
              `${col
                .querySelector("td:nth-of-type(3)")
                .innerHTML.replace(/ /g, "")}`,
              `${col.querySelector("td:nth-of-type(1)").innerHTML}`
            ]
              .join(",")
              .replace(/&nbsp;/g, "&")
              .replace(/\n/g, "")
          );
        });
        return cols;
      }))
    );
    isEnded = await page.evaluate(() => {
      return document
        .querySelector(".nablarch_nextSubmit")
        .classList.contains("is-disabled");
    });
    if (!isEnded) {
      await page.click(".nablarch_nextSubmit");
      await page.waitForNavigation();
      await delay(500);
    }
  }
  console.log(result.join("\n"));
  await browser.close();
}

async function postToMoneyTree() {}

(async () => {
  await scrapingFromMUFG();
  await postToMoneyTree();
})();
