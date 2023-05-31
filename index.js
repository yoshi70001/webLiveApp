const express = require("express");
const { load } = require("cheerio");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();

app.use(cors())
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
  try {
    let route = "https://futbol-libre.org/" + req.params.subrute;
    fetch(route)
      .then((textHtml) => {
        return textHtml.text();
      })
      .then((rest) => {
        let $ = load(rest.replaceAll("https://futbol-libre.org", ""));
        if ($("#iframe").prop("src") === undefined)
          throw Error("no se puede cargar el recurso");
        res.redirect(
          "/now/" +
            req.params.subrute +
            "?" +
            $("#iframe").prop("src").split("?")[1] +
            "&rute=" +
            encodeURIComponent($("iframe").prop("src"))
        );
      })
      .catch((es) => {
        console.error(es);
        res.send("no se puede cargar el recurso intenta otra");
      });
  } catch (error) {
    res.send("no se puede cargar el recurso intenta otra");
  }
});
app.get("/now/:subrute", function (req, res) {
  getPage(decodeURIComponent(req.query.rute)).then((cuerpo) => {
    res.send(cuerpo + "");
  });
});
app.listen("10000");
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
