const express = require("express");
const app = express();

const path = require("node:path");

const session = require("express-session");

const puppeteer = require("./pup");

app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(function (req, res, next) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; font-src 'self'; img-src 'self' https://i.imgur.com https://randomuser.me https://cdn2.vectorstock.com; script-src 'self' 'unsafe-inline'; style-src 'self' https://cdn.jsdelivr.net https://fonts.googleapis.com; frame-src 'self'"
    );
    next();
  });

const {users} = require("./users");

const validCredentials = (email, password) => {
  const user = users.find((x) => x.email === email && x.password === password);
  return user;
};

const requireAuth = (req, res, next) => {
  if (req.session.username) {
    next(); // User is authenticated, continue to next middleware
  } else {
    res.redirect("/login"); // User is not authenticated, redirect to login page
  }
};


app.get("/", (req, res) => {
  res.redirect("profile");
});

app.get("/login", (req, res) => {
  if (req.session.username) {
    res.redirect("profile");
  } else {
    res.render("login");
  }
});

app.post("/login", (req, res) => {
  // Validate user credentials
  if ((user = validCredentials(req.body.email, req.body.password))) {
    req.session.username = user.username;
    res.redirect("/profile");
  } else {
    res.render("login", { error: "Invalid username or password" });
  }
});

app.get("/easyFlag", requireAuth, (req, res) => {
  if(req.headers.host === 'give.me.the.flag'){
    res.send(process.env.EASYFLAG);
  }
  else {
    res.redirect("/profile");
  }
});


app.get("/profile*", requireAuth, (req, res) => {
  username = req.originalUrl.split("-")[1];
  if (username === "admin") {
    let admin = Object.assign({}, users.find((x) => x.username === "admin"));
    admin.flag = "flag{<REDACTED>}";
    res.render("profile", admin);
  } else if (username != undefined && users.find((x) => x.username === username)) {
    res.render(
      "profile",
      users.find((x) => x.username === username)
    );
  } else {
    res.render(
      "profile",
      users.find((x) => x.username === req.session.username)
    );
  }
});

app.get("/randomProfile", requireAuth, (req, res) => {
    res.redirect("/profile-" + users[Math.floor(Math.random() * users.length)].username);
  });


app.get("/sandbox", requireAuth, (req, res) => {
    res.render('sandbox', { payload: req.query.payload });
});

// Report a user profile to the admin. Still under development..
app.get("/reportToAdmin", requireAuth, (req, res) => {
  // If the "encodeURI" parameter is set, let's encode the user payload (just in case special characters are needed..) 
  if(req.query.encodeURI){
    puppeteer.visitProfile(encodeURIComponent(req.query.username), admintoken);
  }
  else{
    puppeteer.visitProfile(req.query.username, admintoken);
  }
  res.send("<script>alert('Successfully sent! Admin will review the user profile page as soon as possible..')</script>");
});


let admintoken = "";

app.listen(process.env.PORT, () => {
  console.log("Listening at port: " + process.env.PORT );

  puppeteer
  .login("http://" + process.env.DOMAIN + "/login")
  .then((res) => {
    console.log("Admin session cookie: ", res);
    admintoken = res;
  })
  .catch((e) => {
    console.log(e);
  });

});





