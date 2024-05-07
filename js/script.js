import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(process.env.URL);

  await page.setViewport({ width: 1080, height: 1024 });

  // const product = await page.$eval("#card_parts", (e) => e.innerHTML);

  console.log("aaaaa");

  const products = await page.evaluate(() => {
    const table = document.querySelector(
      "table.align-middle > tbody:nth-child(2)"
    );
    const rows = table.querySelectorAll("tr");
    const products = [];

    for (let i = 0; i < rows.length; i++) {
      const product = {};

      product.id = i + 1;

      const idElement = rows[i].querySelector("td:nth-child(1) > span");
      product.id = idElement ? idElement.innerHTML : null;

      const skuElement = rows[i].querySelector(
        "td:nth-child(2) > a:nth-child(3) > p:nth-child(1) > span:nth-child(1)"
      );

      console.log("test");
      product.sku = skuElement ? skuElement.innerHTML : null;

      const nameElement = rows[i].querySelector(
        "td:nth-child(3) > div:nth-child(1) > span:nth-child(1)"
      );
      product.name = nameElement ? nameElement.innerHTML : null;

      // element.name = page.$eval(
      //   "card-header bg-primary > div > text-center col-12 col-lg-4 order-last order-lg-1 > fs-3 text-uppercase fw-bold",
      //   (e) => {
      //     return e.innerHTML;
      //   }
      // );

      // product.sku = page.eval$(
      //   "d-flex flex-wrap d-md-table-row > td:nth-child(1) > a > p > span:nth-child(2)",
      //   (e) => {
      //     return e.innerHTML;
      //   }
      // );

      // const nameElement = element.querySelector(
      //   "card-header bg-primary > div > text-center col-12 col-lg-4 order-last order-lg-1 > fs-3 text-uppercase fw-bold"
      // );
      // product.name = nameElement ? nameElement.innerHTML : null;

      // console.log(product.name);

      // product.coordinateTop = element.getAttribute();
      // product.coordinateLeft = element.getAttribute();
      products.push(product);
    }

    return products;
  });

  await browser.close();

  console.log(products);
})();
