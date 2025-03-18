const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const path = require("path");
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "learn",
  password: "mohan@2003",
});

let crandom = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
};

app.get("/", (req, res) => {
  let q = "select count(id) from user";
  let r;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log(result[0]["count(id)"]);
      res.render("home.ejs", { count: result[0]["count(id)"] });
    });
  } catch (err) {
    console.log(err);

    res.send("something went wrong");
  }
});

app.get("/user", (req, res) => {
  let q = "select id,username,email from user";
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.render("show.ejs", { result: result });
    });
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `select * from user where id = "${id}"`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { username: newusername, password: formpass } = req.body;
  let q = `select * from user where id= '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (user.password != formpass) {
        res.send("wrong password");
      } else {
        let q2 = `update user set username = '${newusername}' where id='${id}'`;
        try {
          connection.query(q2, (err, result) => {
            if (err) throw err;
            res.redirect("/user");
          });
        } catch (err) {
          console.log(err);
          res.send("somethind went wrong");
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
});

app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let {
    username: newusername,
    email: newemail,
    password: newpassword,
  } = req.body;
  let newid = uuidv4();
  q = "insert into user(id,username,email,password) values (?,?,?,?)";
  let val = [newid, newusername, newemail, newpassword];
  try {
    connection.query(q, val, (err, result) => {
      if (err) throw err;
      res.redirect("/user");
    });
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `select * from user where id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.render("delete.ejs", { user: result[0] });
    });
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: pass } = req.body;
  q = `select * from user where id= '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log(result);
      if (pass != result[0]["password"]) {
        req.send("password is incorrect");
      } else {
        let q2 = `delete from user where id='${id}'`;
        try {
          connection.query(q2, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.redirect("/user");
          });
        } catch (err) {
          console.log(err);
          res.send("somthing went wrong");
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.send("something went wrong");
  }
});

app.listen(8080, () => {
  console.log(`app is listen on port 8080`);
});
