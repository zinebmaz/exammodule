const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'votre_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Utilisateur statique (remplacez par une base de données)
const users = [
  { id: 1, username: 'utilisateur', password: 'motdepasse' }
];

// Configuration de la stratégie d'authentification locale
passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Définition des chemins vers les fichiers statiques (comme les fichiers HTML)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.send('Accueil');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login'
}));

app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      // Gérer les erreurs si nécessaire
      return next(err);
    }
    res.redirect('/'); // Redirection après la déconnexion
  });
});



// Lancement du serveur
const port = 3000;
app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});