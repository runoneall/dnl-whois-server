import express from "express";
import ejs from "ejs";

const app = express();

app.engine("ejs", ejs.renderFile);
app.set("view engine", "ejs");
app.use(express.static("public"));

const getInfo = async (domain) => {
  const whoisServer = "https://domain.nodeloc.com/api/public/whois/";
  const resp = await fetch(whoisServer + domain);
  return await resp.json();
};

app.get("/:domain", async (req, res) => {
  const currentHost = req.get("host");
  res.header("Content-Type", "text/plain; charset=utf-8");

  try {
    const data = await getInfo(req.params.domain);
    if (data.error) {
      return res.status(400).send(`Error: ${data.error}`);
    }

    res.render("text.ejs", {
      data: data,
      host: currentHost,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/rdap/:domain", async (req, res) => {
  const currentProtocol = req.protocol;
  const currentHost = req.get("host");
  res.header("Content-Type", "application/rdap+json; charset=utf-8");

  try {
    const data = await getInfo(req.params.domain);
    if (data.error) {
      return res.status(400).send(`Error: ${data.error}`);
    }

    res.render("json.ejs", {
      data: data,
      protocol: currentProtocol,
      host: currentHost,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorCode: 500, title: "Internal Server Error" });
  }
});

app.listen(3000, () => console.log("Server started"));
