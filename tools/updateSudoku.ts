import http from "http";

const url = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/sudoku/generate?secret=${process.env.SECRET}`;
http.get(url);