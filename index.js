const express = require("express");
const { load } = require("cheerio");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get("/", function (req, res) {
  fetch("https://futbol-libre.org/agenda/")
    .then((textHtml) => {
      return textHtml.text();
    })
    .then((rest) => {
      let $ = load(rest.replaceAll("https://futbol-libre.org", "/pre"));
      res.send($.html());
    });
});
app.get("/pre/:subrute", function (req, res) {
  fetch("https://futbol-libre.org/" + req.params.subrute)
    .then((textHtml) => {
      return textHtml.text();
    })
    .then((rest) => {
      let $ = load(rest.replaceAll("https://futbol-libre.org", ""));
      
      res.redirect("/" + req.params.subrute + "?id=1071");
    });
});
app.get("/:subrute", function (req, res) {
  res.send("player - " + req.query.id);
});
app.listen("3000");
async function getPage(url) {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  let solicitud = await fetch(url, requestOptions);
  let cuerpo = await solicitud.text();
  if (solicitud.status === 410) {
    console.log(solicitud.status);
    return await getPage(url);
  } else {
    console.log(solicitud.status);
    return await cuerpo;
  }
}
