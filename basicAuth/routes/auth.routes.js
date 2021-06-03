const mongoose = require('mongoose');
const { Router } = require('express');
const router = new Router();
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const User = require('../models/User.model')

 
// .get() route ==> to display the signup form to users
router.get('/signup', (req, res)=> {
  
  console.log('session ====>',req.session.currentUser)
  res.render('auth/signup')
})
 
// .post() route ==> to process form data
router.post('/signup', async (req, res, next) => {
    const {username, email, password} = req.body;    

    if (!username || !email || !password) {
      res.render('auth/signup', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
      return;
    }

    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
      res.status(500).render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
      return;
    }


    bcryptjs
      .genSalt(saltRounds)
      .then(salt => bcryptjs.hash(password, salt))
      .then(hashedPass => {
        
        return User.create({username, email, passwordHash : hashedPass})
      })
      .then( userFromDB => {
        console.log('newly created user:', userFromDB)
        res.redirect('/login')
      })
      .catch(error => {
        if (error instanceof mongoose.Error.ValidationError) {
          res.status(500).render('auth/signup', { errorMessage: error.message });
        } else if (error.code === 11000) {
          res.status(500).render('auth/signup', {
             errorMessage: 'Username and email need to be unique. Either username or email is already used.'
          });
        } else {
          next(error);
        }
      });
}) 


router.post('/login', (req, res) => {
  const{ username, password } = req.body
  
  console.log('SESSION =====> ', req.session)

  if (username === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }
    
  async function checkHashedPass(username, password){    
    try{
      const userDB = await User.findOne({username})
      if(userDB === null){
        res.status(500).render('auth/login', {errorMessage : `username doesn't exist, signup before you try to login`})
      }
      const match = await bcryptjs.compare(password, userDB.passwordHash)
      if(match){
        req.session.currentUser = userDB;
        console.log('SESSION =====> ', req.session)
        res.status(200).redirect('/userProfile')
      }else{
        res.status(500).render('auth/login', {errorMessage : `Incorrect username or password`})
      }
    }catch{
      console.log('error while checking userin DB and password' , error)
    }
  }
  checkHashedPass(username, password)
})


router.get('/login', (req, res) => {
  res.render('auth/login')
});


router.get('/userProfile', (req, res) => {
  console.log(req.session.currentUser)
  res.render('users/user-profile', {userInSession : req.session.currentUser})
});


module.exports = router;