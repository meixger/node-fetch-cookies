const chalk = require("chalk");
const express = require("express");
const getAvailablePort = require("./findnextport.js");
const app = express();
let baseUrl = "";

// Fetch '/api' and received 'set-cookie' header
app.get("/", async (req, res) => {
  const setCookie = (await fetch(baseUrl + "/api")).headers.get("set-cookie");

  logHome(setCookie);

  // the response header 'set-cookie' must be splitted to multiple response headers
  // see https://github.com/nfriedly/set-cookie-parser#splitcookiesstringcombinedsetcookieheader
  const list = setCookie.split(",").map((c) => c.trim());

  const body =
    req.header("Accept") === "*/*"
      ? `set-cookie header: ${setCookie}\nbroken split:\n${list
          .map((c, i) => `${i}: ${c}`)
          .join("\n")}`
      : `<pre>set-cookie header: '${setCookie}'</pre><p>broken split:</p><ol>${list
          .map((c) => `<li>${c}</li>`)
          .join("")}</ol>`;
  res.send(body);
});

// Return 2 cookies which will be combined by Node.js to a comma separeted single header
app.get("/api", (req, res) => {
  const expires = new Date(2023, 5, 1, 12);
  res.cookie("user", "alice", { expires: expires, httpOnly: true });
  res.cookie("role", "guest");

  logApi(res);

  res.send("Hello World!");
});

requireNodeVersion(18);

getAvailablePort(3000).then((port) => {
  const server = app.listen(port, () => {
    baseUrl = `http://localhost:${server.address().port}`;
    fetch(baseUrl)
      .then((res) => res.text())
      .then((t) => console.log(chalk.bgCyanBright(t)))
      .then(() =>
        console.log(chalk.bgGray(`App listening on port ${baseUrl}`))
      );
  });
});

/* helper ------------------------------------------------------------------- */

function requireNodeVersion(version) {
  if (parseInt(process.versions.node.split(".")[0]) < version) {
    console.error(
      chalk.bgRedBright("Node.js version >= 18 required. exiting now.")
    );
    process.exit(1);
  }
}

function logHome(setCookie) {
  console.log(chalk.bgGreenBright("('/') res.headers.get('set-cookie'):"));
  console.log(chalk.greenBright(setCookie));
  console.log(
    chalk.bgGreenBright.redBright("note: ^^^ both cookies are now combined")
  );
  // output:
  // user=alice; Path=/; Expires=Thu, 01 Jun 2023 10:00:00 GMT; HttpOnly, role=guest; Path=/
  // 😢 header 'set-cookie' is a combined string
}

function logApi(res) {
  console.log(chalk.bgBlueBright("(api) res.getHeaders()):"));
  console.log(
    chalk.blueBright("(api) " + JSON.stringify(res.getHeaders(), null, 2))
  );
  // output: "set-cookie" : [
  //   "user=alice; Path=/; Expires=Thu, 01 Jun 2023 10:00:00 GMT; HttpOnly",
  //   "role=guest; Path=/"
  // ]

  console.log(chalk.bgBlueBright("(api) res.getHeader('set-cookie'):"));
  console.log(chalk.blueBright("(api) " + res.getHeader("set-cookie")));
  console.log(
    chalk.bgBlueBright.redBright(
      "(api) 😢note: ^^^ both cookies are already combined"
    )
  );
  // 😢output: user=alice; Path=/; Expires=Thu, 01 Jun 2023 10:00:00 GMT; HttpOnly,role=guest; Path=/
}
