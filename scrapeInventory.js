#!/usr/local/bin/node
const { Parser } = require('json2csv'),
    fs = require('fs'),
    fetch = require('node-fetch'),
    args = require('args');

// args
args.option('file', 'Outpuf filename', 'output.csv')
    .option('site', 'URL of the target site', 'www.puravidabracelets.com')
    .option('page', 'Pages to scrape', 5)
const flags = args.parse(process.argv)

// csv
const fields = ['product_id', 'product_title', 'variant_id', 'variant_title', 'variant_price', 'inventory_quantity', 'captured_timestamp']
const parser = new Parser({ header: false, fields: fields });
fs.writeFileSync(flags.file, fields.join(",") + "\n");

// requests
(async () => {
    for (let page = 1; page < flags.page; page++) {
        let resp = await fetch(`https://${flags.site}/products.json?page=${page}`)
        let json = await resp.json()

        for (product of json.products) {
            let resp = await fetch(`https://${flags.site}/products/${product.handle}.json`)
            let json_ = await resp.json()

            for (variant of json_.product.variants) {
                let json = {
                    product_id: product.id,
                    product_title: product.title,
                    variant_id: variant.id,
                    variant_title: variant.title,
                    variant_price: variant.price,
                    inventory_quantity: variant.inventory_quantity,
                    captured_timestamp: new Date()
                }
                console.log(json)
                fs.appendFileSync(flags.file, parser.parse(json) + "\n")
            }

        }
    }
})();
