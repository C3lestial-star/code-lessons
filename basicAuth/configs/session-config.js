const session = require('express-session')

module.exports = app => {
  app.use(session({
    secret: process.env.SESS_SECRET,
    name: 'sid',
    resave: false,
    saveUninitialized: true,
    cookie:{
      maxAge: parseInt(process.env.SESS_LIFETIME),
      sameSite: false,
      httpOnly: true
    },
    rolling: true,
    store: MongoStore.create({ mongoUrl: MONGODB_URI})
  }));
};