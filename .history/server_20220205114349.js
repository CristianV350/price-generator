/*server.js*/
const path = require('path');
const fs = require('fs')
const axios = require('axios')
const cheerio = require('cheerio');
var http = require('http');
var html_to_pdf = require('html-pdf-node');

const { v4: uuidv4 } = require('uuid');
const express = require("express");
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true}));

app.use('/', express.static(__dirname + '/'));

var products = [];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'pret.html'), () => {})
});

app.get('/prices', (req, res) => {
  let prices = fs.readFileSync(path.join(__dirname, 'pret.json'), 'utf8')
  let data = JSON.parse(prices)
  let result = []

  for (let i = 0; i < data.length; i++) {
    const { id, name, color, display, memory, camera, battery, state, price, rate, waranty } = data[i]

    products.push({ id, name, color, display, memory, camera, battery, state, price, rate, waranty })

    result.push({ html: `
    <div class="tag" data-id="${id}">
          <h2>${name}</h2>
          <ul style="width:5cm;">
              <li style="width:5cm;display:flex;justify-content: space-between;">
                  <span>Culoare:</span>
                  <span>${color}</span>
              </li>
              <li style="width:5cm;display:flex;justify-content: space-between;">
                  <span>Ecran:</span>
                  <span>${display}</span>
              </li>
              <li style="width:5cm;display:flex;justify-content: space-between;">
                  <span>Memorie:</span>
                  <span>${memory}</span>
              </li>
              <li style="width:5cm;display:flex;justify-content: space-between;">
                  <span>Camera:</span>
                  <span>${camera}</span>
              </li>
              <li style="width:5cm;display:flex;justify-content: space-between;">
                  <span>Baterie:</span>
                  <span>${battery}</span>
              </li>
              <li style="width:5cm;display:flex;justify-content: space-between;">
                  <span>Starea:</span>
                  <span>${state}</span>
              </li>
          </ul>
          <div class="prices">
              <div>
                  <p>Pret standard</p>
                  <h2>${price}</h2>
              </div>
              <div id="second-prices">
                  <div>
                      <p>Pret in rate / 12 luni</p>
                      <h5>${rate}</h5>
                  </div>
                  <div>
                      <p>Pret Garantie</p>
                      <h5>${waranty}</h5>
                  </div>
              </div>
          </div>
      </div>
    `, data: data[i] })
  }

  res.send(result)
})

app.post('/delete', (req, res) => {
  const { id, name, color, display, memory, camera, battery, state, price, rate, waranty } = req.body

  let prices = fs.readFileSync(path.join(__dirname, 'pret.json'), 'utf8')
  let data = JSON.parse(prices)

  data = data.filter(item => item.id !== id)
  console.log(data)

  fs.writeFile('pret.json', JSON.stringify(data), err => {
    if (err) console.log(err)
  })

})

app.post('/prices/:id', (req, res) => {
  const { id } = req.params

  let prices = fs.readFileSync(path.join(__dirname, 'pret.json'), 'utf8')
  let data = JSON.parse(prices)

  data = data.find(item => item.id === id)
  console.log(data)

  res.send(data)
})

app.post('/add', (req, res) => {
  const { id, name, color, display, memory, camera, battery, state, price, rate, waranty } = req.body

  let prices = fs.readFileSync(path.join(__dirname, 'pret.json'), 'utf8')
  let data = JSON.parse(prices)

  let insert = {
    id: uuidv4(),
    name: name,
    color: color,
    display: display,
    memory: memory,
    battery: battery,
    camera: camera,
    state: state,
    price: price,
    rate: rate,
    waranty: waranty
  }
  console.log(data)
  if (!id) data.push(insert)
  if (id){
    let edit = data.findIndex(item => item.id === id)
    if (edit >= 0) {
      insert.id = id
      data.splice(edit, 1, insert)
    }
  } 

  fs.writeFile('pret.json', JSON.stringify(data), err => {
    if (err) console.log(err)
  })
  res.send(data)
})




app.post('/export', (req, res) => {
  let data = req.body.html
  var html = fs.readFileSync(path.join(__dirname, "generator.html"), "utf8");

  const ch = cheerio.load(html)
  ch('body').html(data)
  ch('head').html('<link rel="stylesheet" href="style.css" />')
  ch('body').append('<a id="download" href="/generator2.html" style="visibility:none" download></a></body></html>')

  fs.writeFileSync(path.join(__dirname, "generator.html"), ch.html(), err => {
    if(err) console.log(err)

    console.log(`${req.protocol}://${req.headers.host}`)
    const file = fs.createWriteStream(path.join(__dirname, "generator2.html"));
  
    http.get(`${req.protocol}://${req.headers.host}/generator.html`, function(response) {
      response.pipe(file);
    });

    let options = { format: 'A4' };
    // Example of options with args //
    // let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    let f = { url: `${req.protocol}://${req.headers.host}/generator2.html` };

    html_to_pdf.generatePdf(f, options).then(pdfBuffer => {
      console.log("PDF Buffer:-", pdfBuffer); 
    });
  })
})


app.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
});