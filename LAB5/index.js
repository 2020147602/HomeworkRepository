const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const fs = require("fs").promises;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  let db = await getDBConnection();
  let items = await db.all(`SELECT * FROM products`);
  await db.close();

  let item_list = ``;

  for (const item of items) {
    const imgURL = (image = `/images/${item["product_image"]}`);

    item_list += `
            <div class="columnContainer item">
                <img src=${imgURL} alt=${item["product_title"]} />
                <p>Name: ${item["product_title"]}</p>
                <p>Category: ${item["product_category"]}</p>
                <a href="/product/${item["product_id"]}">자세한 정보→</a>
            </div>`;
  }

  let template = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>메인</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" type="text/css" href="main.css">
            </head>
            <body>
            <header>
            <p>미래를 향한 대담한 비전</p>
            <h1 id="header">FUTURING GENESIS</h1>
          </header>
          <nav class="navigation">
            <div class="navi main" onclick="location.href='/'">
              메인페이지
            </div>
            <div class="navi login" onclick="location.href='/login'">로그인</div>
            <div class="navi sign" onclick="location.href='/signup'">
              회원가입
            </div>
          </nav>
          <p id="banner>Take care of your car in the garage: it will take care of you on the road</p>
                <div class="columnContainer">
                    <div class="columnContainer">
                        <form action="/search" method="GET">
                            <input name="keyword" id="keyword" type="text" placeholder="키워드를 입력하세요" class="searchInput" />
                            <input name="category" id="category" type="text" list="categories" placeholder="카테고리를 선택하세요" class="searchInput" />
                            <datalist id="categories">
                                <option value="승용">
                                <option value="MPV">
                                <option value="SUV">
                            </datalist>
                            <input id="search" type="submit" value="검색하기" class="searchButton" />
                        </form>
                        <p>Choose your future!</p>
                        <div class="itemContainer" id="main">
                            ${item_list}
                        </div>
                    </div>
                    
                </div>
            </body>
        </html>`;

  res.send(template);
});

app.get("/search", async (req, res) => {
  let db = await getDBConnection();
  let items = await db.all(
    `SELECT * FROM products Where product_title Like '${req.query.keyword}%' And product_category Like '${req.query.category}%'`
  );
  await db.close();

  let item_list = ``;

  for (const item of items) {
    const imgURL = (image = `/images/${item["product_image"]}`);

    item_list += `
            <div class="columnContainer item">
                <img src=${imgURL} alt=${item["product_title"]} />
                <p>제목: ${item["product_title"]}</p>
                <p>카테고리: ${item["product_category"]}</p>
                <a href="/product/${item["product_id"]}">자세한 정보→</a>
            </div>`;
  }

  let template = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>메인</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" type="text/css" href="main.css">
            </head>
            <body>
            <header>
          <p>미래를 향한 대담한 비전</p>
          <h1 id="header">FUTURING GENESIS</h1>
        </header>
        <nav class="navigation">
          <div class="navi main" onclick="location.href='/'">
            메인페이지
          </div>
          <div class="navi login" onclick="location.href='/login'">로그인</div>
          <div class="navi sign" onclick="location.href='/signup'">
            회원가입
          </div>
        </nav>
        <p id="banner>Take care of your car in the garage: it will take care of you on the road</p>
                <div class="columnContainer">
                    <div class="columnContainer">
                        <a href="/">판매 중인 자동차 보기→</a>
                        <p>검색 결과</p>
                        <div class="itemContainer" id="main">
                            ${item_list}
                        </div>
                    </div>
                   
                </div>
            </body>
        </html>`;

  res.send(template);
});

app.get("/product/:product_id", async (req, res) => {
  let db = await getDBConnection();
  let item = await db.get(
    `SELECT * FROM products WHERE product_id = ${req.params.product_id}`
  );
  await db.close();

  image = `/images/${item["product_image"]}`;

  let commentFile = await fs.readFile("comment.json", "utf8");
  let data = JSON.parse(commentFile);
  let comments = data[req.params.product_id];

  let comment_list = ``;

  for (const comment of comments) {
    comment_list += `<p>${comment}</p>`;
  }

  let template = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>${item["product_title"]}</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" type="text/css" href="/main.css">
            </head>
            <body>
            <header>
            <p>미래를 향한 대담한 비전</p>
            <h1 id="header">FUTURING GENESIS</h1>
          </header>
          <nav class="navigation">
            <div class="navi main" onclick="location.href='/'">
              메인페이지
            </div>
            <div class="navi login" onclick="location.href='/login'">로그인</div>
            <div class="navi sign" onclick="location.href='/signup'">
              회원가입
            </div>
          </nav>
                <p id="banner>Take care of your car in the garage: it will take care of you on the road</p>
                
                <div class="detailText">
                    <h1>[${item["product_category"]}] ${item["product_title"]}</h1>
                    <h2>Price : ${item["product_price"]}</h2>
                  
                    <p>Car NUM : ${item["product_id"]}</p>
                    <img src=${image} alt=${item["product_title"]} />
                    <h5>후기</h5>
                    ${comment_list}
                    <form action="/product/${item["product_id"]}/write_comment" method="POST">
                        <input type="text" name="comment" />
                        <button type="submit">업로드</button>
                    </form>
                </div>
            </body>
        </html>
    `;

  res.send(template);
});

app.post("/product/:product_id/write_comment", async (req, res) => {
  let comments = await fs.readFile("comment.json", "utf8");
  let data = JSON.parse(comments);
  data[req.params.product_id].push(req.body.comment);
  fs.writeFile("comment.json", JSON.stringify(data));
  res.redirect(`/product/${req.params.product_id}`);
});
app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

async function getDBConnection() {
  const db = await sqlite.open({
    filename: "product.db",
    driver: sqlite3.Database,
  });

  return db;
}

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server is listening on http://localhost:${port}`);
});

