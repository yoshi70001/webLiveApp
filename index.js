const express = require("express");
const { load } = require("cheerio");
const cors = require("cors");
const app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get("/", function (req, res) {
  fetch("https://futbol-libre.org/agenda/")
    .then((textHtml) => {
      return textHtml.text();
    })
    .then((rest) => {
      let $ = load(rest.replaceAll("https://futbol-libre.org", ""));
      res.send($.html());
    });
});
app.get("/:subrute", function (req, res) {
  fetch("https://futbol-libre.org/" + req.params.subrute)
    .then((textHtml) => {
      return textHtml.text();
    })
    .then((rest) => {
      let $ = load(rest.replaceAll("https://futbol-libre.org", ""));
      //   res.send($.html());
      res.redirect($("iframe").prop("src"));
    });
});
app.listen("3000");
