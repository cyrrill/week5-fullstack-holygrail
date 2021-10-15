const express = require('express');
const app = express();
const redis = require('redis');
const client = redis.createClient();

// Serve static files from public directory
app.use(express.static("public"));

// Initialize values for: header, left, right, article and footer using the redis client
client.mset('header', 0, 'left', 0, 'right', 0, 'article', 0, 'footer', 0);

// Get values for holy grail layout
function data() {
  return new Promise((resolve, reject) => {
    client.mget(
      ['header', 'left', 'right', 'article', 'footer'],
      (err, val) => err ? reject() : resolve({
        header:  +val[0],
        left:    +val[1],
        right:   +val[2],
        article: +val[3],
        footer:  +val[4]
      })
    );
  });
}

// Use the redis client to update the value associated with the given key
app.get("/update/:key/:value", function (req, res) {
  client.incrby(req.params.key, +req.params.value, (err, _) => {
    err ? res.status(500).send({}) : data().then(data => { console.log(data); res.send(data)})
  });
});

// get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
