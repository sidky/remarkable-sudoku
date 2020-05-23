const http = require("http");

const url = `http://${process.env.HEROKU_APP_NAME}.herokuapp.com/sudoku/generate?secret=${process.env.SECRET}`;
console.log(`Requesting an update: ${url}`);
http.get(url, (res) => {
    console.log(`Response: ${res}`);
});

console.log("Done")