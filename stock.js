var http = require('http');
var fs = require('fs');
var qs = require('querystring');
const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://hmesfi01:z56Nxuv68p41XtvE@cluster0.uzhbjzw.mongodb.net/test";
const client = new MongoClient(uri);

http.createServer(async function (req, res) {
  // res.writeHead(200, {'Content-Type':'text/html'});
  if (req.url == "/process"){
      await connect();
      myFile = 'final.html';
      fs.readFile(myFile, async function (err, txt) {
          res.writeHead(200, {'Content-Type':'text/html'});
          res.write (txt);
          pageData = "";
          req.on('data', data => {
              pageData += data.toString();
          });
          // when complete POST data is received
          req.on('end', () => {
              pageData = qs.parse(pageData);
              searchdata(pageData['theinput'], res, pageData['p_or_d'] === "company");
        });
    });

} else {
    file = 'index.html';
    fs.readFile(file, function(err, txt) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(txt);
        res.end();
    });
}
  
}).listen(8080);

function searchdata(query, res, comp) {
    const dbo = client.db("eq");
    const collection = dbo.collection('equities');

    collection.find(comp ? {"name": query} : {"ticker": query + "\r"}).toArray(async function (err, result) {
      if (err) throw err;

      console.log(result);

      if (result.length == 0) {
          res.write("No results found for: " + query);
      }

      await client.close();

      for (let i = 0; i < result.length; i++) {
          res.write("Company Name: " + result[i].name);
          res.write("<br>");
          res.write("Stock Ticker: " + result[i].ticker);
          res.write("<br>");
      }

      res.end();
  });
}

async function connect() {
    await client.connect();
    await client.db("eq").command({ping: 1});
    console.log("Server Connected Successfully");
}