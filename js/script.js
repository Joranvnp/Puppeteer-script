import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(process.env.URL);

  await page.setViewport({ width: 1080, height: 1024 });

  const products = await page.evaluate(() => {
    const elements = document.querySelectorAll("#card_parts");
    const products = [];

    elements.forEach(async (element) => {
      const product = {};
      product.id = "1";

      const skuElement = await element.waitForSelector(
        "d-flex flex-wrap d-md-table-row > td:nth-child(1) > a > p > span:nth-child(2)"
      );
      product.sku = skuElement.innerText;

      const productNameElement = await element.waitForSelector(
        "card-header bg-primary > div > text-center col-12 col-lg-4 order-last order-lg-1 > fs-3 text-uppercase fw-bold"
      );
      product.name = productNameElement.innerText;

      product.coordinateTop = element.getAttribute();
      product.coordinateLeft = element.getAttribute();
      products.push(product);
    });

    return products;
  });

  console.log(products);
})();
