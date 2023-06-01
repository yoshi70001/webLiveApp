const express = require("express");
const { load } = require("cheerio");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
// respond with "hello world" when a GET request is made to the homepage
app.get("/", function (req, res) {
  fetch("https://futbol-libre.org/agenda/")
    .then((textHtml) => {
      return textHtml.text();
    })
    .then((rest) => {
      let $ = load(
        rest.replace(
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&=]*)/g,
          "/pre"
        )
      );
      res.send($.html());
    })
    .catch((err) => {
      console.error(err);
      res.send("hola el servicio esta fuera de linea");
    });
});
app.get("/pre/:subrute", function (req, res) {
  try {
    let route =
      "https://futbol-libre.org/" + req.params.subrute + "/?r=" + req.query.r;
    console.log(req.query);
    fetch(route)
      .then((textHtml) => {
        return textHtml.text();
      })
      .then((rest) => {
        let $ = load(rest);
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
        res.send("no se puede cargar el recurso intenta otra" + route);
      });
  } catch (error) {
    res.send("no se puede cargar el recurso intenta otra" + route);
  }
});
app.get("/now/:subrute", function (req, res) {
  getPage(decodeURIComponent(req.query.rute)).then((cuerpo) => {
    res.send(cuerpo + "");
  });
});
app.listen(port, () => console.log("servicio en linea en el puerto " + port));
async function getPage(url) {
  try {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    let solicitud = await fetch(url, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language":
          "es-419,es;q=0.9,es-ES;q=0.8,en;q=0.7,en-GB;q=0.6,en-US;q=0.5",
        "sec-ch-ua":
          '"Microsoft Edge";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "iframe",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "cross-site",
        "upgrade-insecure-requests": "1",
        Referer: "https://futbol-libre.org/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    });
    let cuerpo = await solicitud.text();
    if (solicitud.status === 410) {
      console.log(solicitud.status);
      return await getPage(url);
    } else {
      console.log(solicitud.status);
      return await cuerpo;
    }
  } catch (erss) {
    return "error al cargar recurso - " + url;
  }
}
