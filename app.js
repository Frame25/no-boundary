const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const app = express();
const jsonParser = bodyParser.json();
const skill = require('./skill-no-boundary.js');

function createConnection() {
  return mysql.createConnection({
    host: "**************",
    user: "**************",
    password: "**************",
    database: "**************"
  });
}

app.post("/path-to-skill", async (req, res) => {
  const con = createConnection();
  const posts = await getPosts(con);
  const countries = await getCountries(con);
  const answer = await skill(req, {posts, countries});

  if (!answer) res.sendStatus(400);
  res.json(answer);
  con.end();
})

// Получить все посты или по определенному критерию: id, country, tags
app.get("/posts", async (req, res) => {
  const con = createConnection();
  const countries = await getCountries(con);
  let sqlQuery = 'SELECT posts.id AS id, posts.title AS title, posts.text AS text, posts.tts AS tts, posts.image AS image, posts.tags AS tags, posts.date AS date, posts.country AS country, countries.name AS country_name, countries.alias AS country_alias FROM posts JOIN countries ON posts.country = countries.id';
  if (Object.keys(req.query).length && (req.query.id || req.query.country || req.query.tag)) {
    let conds = [];
    
    if (req.query.id) {
      conds.push(`posts.id = ${req.query.id}`);
    }
    if (req.query.country) {
      let foundCountry = countryFind(countries, req.query.country) || {id: -1};
      conds.push(`posts.country = ${foundCountry.id}`);
    }
    if (req.query.tag) {
      conds.push(`posts.tags LIKE "%${String(req.query.tag).toLocaleLowerCase()}%"`);
    }
    
    sqlQuery += ` WHERE ${conds.join(' OR ')}`;
  }

  con.query(sqlQuery, (err, result) => {
    if (err) {con.end(); return res.sendStatus(400);}
    res.json({posts: result, countries: countries || []});
  })
  con.end();
})

// Добавить пост (название и текст - обязательны)
app.post("/posts", jsonParser, async (req, res) => {
  const con = createConnection();
  let sqlQuery;
  if(req.body && req.body.title && req.body.text) {
    // REQUIRE : req.body = { title: String(255), text: String(950), country: String || Number, tags: String }
    const countries = await getCountries().then(r=>r).catch(er=>[]);
    let foundCountry = countryFind(countries, req.body.country) || {id: 0};
    sqlQuery = `INSERT INTO posts (title, text, tts, image, country, tags) VALUE (${JSON.stringify(req.body.title)}, ${JSON.stringify(req.body.text)}, ${JSON.stringify(req.body.tts || '')}, ${JSON.stringify(req.body.image || '')}, ${foundCountry.id}, ${JSON.stringify(req.body.tags || '')})`;
  } else if (req.body.update && req.body.post) {
    // REQUIRE : req.body = { update: Boolean, post: { id: Number, text: String, title: String, tags: String, country: Number) }}
    if (req.body.post.id && req.body.post.title && req.body.post.text && req.body.post.country) {
      const countries = await getCountries().then(r=>r).catch(er=>[]);
      let foundCountry = countryFind(countries, req.body.post.country) || {id: 0};
      sqlQuery = `UPDATE posts SET title = ${JSON.stringify(req.body.post.title)}, text = ${JSON.stringify(req.body.post.text)}, tts = ${JSON.stringify(req.body.post.tts || "")}, image = ${JSON.stringify(req.body.post.image) || ""}, tags = ${JSON.stringify(req.body.post.tags) || ""}, country = ${foundCountry.id} WHERE id = ${req.body.post.id}`;
    } else { return res.sendStatus(400); }
  } else {
    return res.sendStatus(400);
  }
  
  con.query(sqlQuery, (err, result) => {
    if (err) {con.end(); return res.sendStatus(400);}
    res.json(result);
  })
  con.end();
})

// Удалить пост по id
app.delete('/posts/:id', (req, res) => {
  const con = createConnection();
  if (!req.params.id || typeof parseInt(req.params.id) !== 'number') {con.end(); return res.sendStatus(400);}
  con.query(`DELETE FROM posts WHERE id = ${req.params.id}`, (err, result) => {
    if (err) {con.end(); return res.sendStatus(400);}
    res.json(result);
  })
  con.end();
})

// Получить все страны
app.get("/countries", (req, res) => {
  const con = createConnection();
  con.query('SELECT * FROM countries', (err, result) => {
    if (err) {con.end(); return res.sendStatus(400);}
    res.json({countries: result});
  })
})

// Добавить страну (Название на русском и алиас на английском - обязательны)
app.post("/countries", jsonParser, async (req, res) => {
  const con = createConnection();
  if(!req.body || !req.body.name || !req.body.name_rp || !req.body.alias) {con.end(); return res.sendStatus(400)}
  let countries = await getCountries(con);
  req.body.alias = String(req.body.alias).toLocaleLowerCase().replace(/(\s|\W|\d)/g, '');
  let foundCountry = countryFind(countries, req.body.name);
  if (foundCountry) {con.end(); return res.send(foundCountry);}

  con.query(`INSERT INTO countries (name, name_rp, alias) VALUE ("${req.body.name}", "${req.body.name_rp}", "${req.body.alias}")`, (err, result) => {
    if (err) {con.end(); return res.sendStatus(400);}
    res.json(result);
  })
  con.end();
})
 

app.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
});

//==========================================================
// FUNCTIONS
//==========================================================

function getCountries () {
  const con = createConnection();
  return new Promise((yes, no) => con.query('SELECT * FROM countries', (err, result) => {
    if (err) {con.end(); no([]);}
    yes(result);
    con.end();
  }))
}

function getPosts () {
  const con = createConnection();
  return new Promise((yes, no) => con.query('SELECT posts.id AS id, posts.title AS title, posts.text AS text, posts.tags AS tags, posts.date AS date, posts.country AS country, countries.name AS country_name, countries.alias AS country_alias FROM posts JOIN countries ON posts.country = countries.id', (err, result) => {
    if (err) {con.end(); no([]);}
    yes(result);
    con.end();
  }));
}

function countryFind (countries = [], country = '') {
  return countries.find(el => {
    if (el.name.slice(-2) === 'ия') {
      el.name_dp = el.name.slice(0, -2) + 'ию';
      if (el.name_dp.toString().toLowerCase() === country.toString().toLowerCase()) return true;
    }
    return el.id.toString() === country.toString() || el.name.toString().toLowerCase() === country.toString().toLowerCase() || el.name_rp.toString().toLowerCase() === country.toString().toLowerCase() || el.alias.toString().toLowerCase() === country.toString().toLowerCase();
  });
}