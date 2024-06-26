import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

import writeCSV from "./writeCSV.js";
import writeDB from "./writeDB.js";

async function launchBrowserAndPage() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(process.env.URL, { timeout: 60000 });

  await page.setViewport({ width: 1080, height: 1024 });

  return { browser, page };
}

async function closeBrowser(browser) {
  await browser.close();
}

async function fetchProducts() {
  const products = [];
  (async () => {
    const { browser, page } = await launchBrowserAndPage();

    const products = await page.$$eval("div.parts_details", (rows) => {
      return rows.map((row) => {
        const product = {};
        const coordinates = {};

        const idElement = row.querySelector(
          "div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(1)"
        );
        product.idProduct = idElement
          ? parseInt(idElement.innerHTML.replace(/\D/g, ""))
          : null;

        const nameElement = row.querySelector(
          "div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1)"
        );
        product.name = nameElement;
        product.name = nameElement
          ? nameElement.innerHTML.replace(/\n/g, "").trim()
          : null;

        const skuElement = row.querySelector(
          "div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(2)"
        );
        product.sku = skuElement
          ? skuElement.innerHTML.replace(/[<>a-z]/g, "").trim()
          : null;

        if (product.sku && !product.sku.includes("-")) {
          product.sku =
            product.sku.slice(0, 3) +
            "-" +
            product.sku.slice(3, product.sku.length - 2) +
            "-" +
            product.sku.slice(product.sku.length - 2, product.sku.length);
        }

        const coordinateElement = window.getComputedStyle(row);
        coordinates.top = coordinateElement.getPropertyValue("top")
          ? parseFloat(coordinateElement.getPropertyValue("top"))
          : 0;
        coordinates.left = coordinateElement.getPropertyValue("left")
          ? parseFloat(coordinateElement.getPropertyValue("left"))
          : 0;

        // product.coordinates = JSON.stringify(coordinates);
        product.coordinates = coordinates;

        return product;
      });
    });

    // Principal
    // const products = await page.$$eval(
    //   "table.align-middle > tbody > tr",
    //   (rows) => {
    //     return rows.map((row) => {
    //       const product = {};

    //       const idElement = row.querySelector("td:nth-child(1) > span");
    //       product.id = idElement
    //         ? parseInt(idElement.innerHTML.replace(/\D/g, ""))
    //         : null;

    //       const skuElement =
    //         row.querySelector(
    //           "td:nth-child(2) > a:nth-child(3) > p:nth-child(1) > span:nth-child(1)"
    //         ) || row.querySelector("td:nth-child(2) > a");
    //       product.sku = skuElement
    //         ? skuElement.innerHTML.replace(/[<>a-z]/g, "").trim()
    //         : null;

    //       const nameElement = row.querySelector(
    //         "td:nth-child(3) > div:nth-child(1) > span:nth-child(1)"
    //       );
    //       product.name = nameElement
    //         ? nameElement.innerHTML.replace(/\n/g, "").trim()
    //         : null;

    //       return product;
    //     });
    //   }
    // );

    // Fonctionnel
    // products.forEach((product, index) => {
    //   product.coordinates = coordinates[index];
    // });

    // Test
    // for (let i = 0; i < products.length; i++) {
    //   products[i].coordinates = coordinates[i];
    // }

    // Test
    // products.forEach((product, productIndex) => {
    //   coordinates[productIndex].forEach((coordinate) => {
    //     product.coordinates = coordinate;
    //   });
    // });

    // Deuxième méthode
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

    // Ecriture du fichier CSV avec les products
    // Crée un nouveau tableau avec coordonnées en json
    const productsCSV = products.map((product) => {
      const coordinates = product.coordinates;
      return { ...product, coordinates: JSON.stringify(coordinates) };
    });
    writeCSV(productsCSV);

    // Ecriture des products dans la base de données
    writeDB(products);

    await closeBrowser(browser);

    // console.log(JSON.stringify(products, null, 1));
    console.log(products);

    console.log(`Nombre de produits : ${products.length}`);
  })();

  return products;
}

const products = fetchProducts();

export { products };
