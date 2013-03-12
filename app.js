var express = require("express"),
    everyauth = require("everyauth");

var app = express();

var users = {};

app.set("view engine", "ejs");

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: "sekret"}));

everyauth.everymodule.findUserById(function(userId, cb){
    if (users[userId]) {
      cb(null, users[userId]);
    } else {
      cb('user could not be found');
    }
  });

everyauth.password
  .getLoginPath('/login')
  .postLoginPath('/login')
  .loginView('login')
  .authenticate(function(login, password){
    if (users[login] && users[login].password === password){
      return users[login];
    }
    return ['login failed'];
  })
  .loginSuccessRedirect('/')
  .getRegisterPath('/register')
  .postRegisterPath('/register')
  .registerView('register')
  .validateRegistration(function(userAttr){
    var errors = [];
    if (userAttr.login.length == 0 || users[userAttr.login]){
      errors.push('must provide a valid username');
    }
    if (userAttr.password.length == 0){
      errors.push("password can't be empty");
    }
    return errors;
  })
  .registerUser(function(userAttr){
    var newuser = {
      password: userAttr.password,
      id: userAttr.login
    };
    users[userAttr.login] = newuser;
    return users[userAttr.login];
  })
  .registerSuccessRedirect('/');

app.use(everyauth.middleware(app));

app.get("/", function(req, res){
  res.render('index', {});
});

app.listen(8080);
