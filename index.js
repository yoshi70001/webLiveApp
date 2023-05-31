const express = require("express");
const { load } = require("cheerio");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
// respond with "hello world" when a GET request is made to the homepage
app.get("/", function (req, res) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://futbol-libre.org/agenda/",
    headers: {},
  };

  axios
    .request(config)
    .then((textHtml) => {
      return textHtml.data;
    })
    .then((rest) => {
      let $ = load(rest.replaceAll("https://futbol-libre.org", "/pre"));
      res.send($.html());
    })
    .catch((err) => {
      console.error(err);
      res.send("hola el servicio esta fuera de linea");
    });
});
app.get("/pre/:subrute", function (req, res) {
  try {
    let route = "https://futbol-libre.org/" + req.params.subrute;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: route,
      headers: {},
    };
    axios
      .request(config)
      .then((textHtml) => {
        return textHtml.data;
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
app.listen(port, () => console.log("servicio en linea en el puerto " + port));
async function getPage(url) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: url,
    headers: {},
  };
  let solicitud = await axios.request(config);
  let cuerpo = await solicitud.data;
  if (solicitud.status === 410) {
    console.log(solicitud.status);
    return await getPage(url);
  } else {
    console.log(solicitud.status);
    return await cuerpo;
  }
}
