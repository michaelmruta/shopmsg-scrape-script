#!/usr/local/bin/node

/**
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: Michael Angelo Ruta (2019)
 *
 **/

const { Parser } = require('json2csv');
const fs = require('fs');
const request = require('request-json');
const args = require('args');

const fields = ['product_id',
    'product_title',
    'variant_id',
    'variant_title',
    'variant_price',
    'inventory_quantity',
    'captured_timestamp'
]

args.option('file', 'Outpuf filename', 'output.csv')
    .option('site', 'URL of the target site', 'www.puravidabracelets.com')
    .option('page', 'Pages to scrape', Infinity)

const flags = args.parse(process.argv)
const client = request.createClient(`https://${flags.site}`);
const parser = new Parser({ header:false, fields: fields });

fs.writeFileSync(flags.file, fields.join(",") + "\n");

function writeToCSV(json) {
    try {
        var csv = parser.parse(json);
        fs.appendFileSync(flags.file, csv + "\n")
    } catch (err) {
        console.error(err);
        process.exit(0);
    }
}

function scrape(page = 1) {
    console.log(flags.site + '/products.json?page='+page)
    var result = {}
    client.get('/products.json?page='+page, function(err, res, body) {
        if(err) {
            console.error(err);
            process.exit(0);
        }
        var products = body.products;
        if( products ) {
            for (var i in products) {
                result.product_id = products[i].id
                result.product_title = products[i].title
                if( products[i].variants ) {
                    var variants = products[i].variants;
                    for (var j = 0; j < variants.length; j++) {
                        result.variant_id = variants[j].id
                        result.variant_title = variants[j].title
                        result.variant_price = variants[j].price
                        result.inventory_quantity = variants[j].inventory_quantity
                        result.captured_timestamp = new Date()
                        writeToCSV(result)
                    }
                }
            }
            if(page < flags.page) {
                scrape(++page)
            }
        }
    })

}

scrape();
