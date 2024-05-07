import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(process.env.URL);

  await page.setViewport({ width: 1080, height: 1024 });

  const products = await page.$$eval(
    "table.align-middle > tbody > tr",
    (rows) => {
      return rows.map((row) => {
        const product = {};

        const idElement = row.querySelector("td:nth-child(1) > span");
        product.id = idElement ? idElement.innerHTML : null;

        const skuElement = row.querySelector(
          "td:nth-child(2) > a:nth-child(3) > p:nth-child(1) > span:nth-child(1)"
        );
        product.sku = skuElement ? skuElement.innerHTML : null;

        const nameElement = row.querySelector(
          "td:nth-child(3) > div:nth-child(1) > span:nth-child(1)"
        );
        product.name = nameElement ? nameElement.innerHTML : null;

        return product;
      });
    }
  );

  const coordinates = await page.$$eval("div.parts", (elements) =>
    elements.map((element) => ({
      top: element.getAttribute("data-base-top"),
      left: element.getAttribute("data-base-left"),
    }))
  );

  products.forEach((product, index) => {
    product.coordinates = coordinates[index];
  });

  // const products = await page.evaluate(() => {
  //   const table = document.querySelector(
  //     "table.align-middle > tbody:nth-child(2)"
  //   );
  //   const rows = table.querySelectorAll("tr");
  //   const products = [];

  //   for (let i = 0; i < rows.length; i++) {
  //     const product = {};

  //     product.id = i + 1;

  //     const idElement = rows[i].querySelector("td:nth-child(1) > span");
  //     product.id = idElement ? idElement.innerHTML : null;

  //     const skuElement = rows[i].querySelector(
  //       "td:nth-child(2) > a:nth-child(3) > p:nth-child(1) > span:nth-child(1)"
  //     );

  //     console.log("test");
  //     product.sku = skuElement ? skuElement.innerHTML : null;

  //     const nameElement = rows[i].querySelector(
  //       "td:nth-child(3) > div:nth-child(1) > span:nth-child(1)"
  //     );
  //     product.name = nameElement ? nameElement.innerHTML : null;

  //     products.push(product);
  //   }

  //   return products;
  // });

  await browser.close();

  console.log(products);
})();
