const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Chemin vers nos données


const initialDataPath =  './assets/initial-data.json';
const dataPath = './assets/data.json';

//récupération de toutes les données Jso,
const allData = require('./assets/data.json');

//recuperation de tous les users

const usersData = allData.users;





// // //recupération des tous les tweets

const tweetsFile = allData.tweets;





const existDataPath = fs.existsSync(dataPath);

// verification si le chemin dataPath existe déjà afin de le créer pour éviter des rédondance à chaque lancement
if(!existDataPath){
    //lecture des données initial
    const initialData = JSON.parse(fs.readFileSync(initialDataPath, 'utf8'));
//récupération de tous les utilisateurs du fichies

    //écriture des données initailes dans data.json

    //avec json.stringify qui permet des traduire les object en chaine json
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));

}

//Fonction qui permet de lire les uses du fichier JSON
function readUsersDataFile() {
    try {
        const userData = fs.readFileSync(dataPath, 'utf8');
         // Convertir la chaîne JSON en objet JavaScript afin de permettre leurs traitement car les données json sont des chaines
         const jsonDataUser = JSON.parse(userData);
         return jsonDataUser.users;
        } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
        return [];
    }
}

function readDataFromFile(filepath) {
    try {
        const data = fs.readFileSync(filepath, 'utf8');
        
       const allData = JSON.parse(data); // Convertir la chaîne JSON en objet JavaScript afin de permettre leurs traitement car les données json sont des chaines
        return allData;
    } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
        return [];
    }
}



function readTweetsDataFile() {
    try {
        const tweetData = fs.readFileSync(dataPath, 'utf8');
        
       const jsonTweets = JSON.parse(tweetData); // Convertir la chaîne JSON en objet JavaScript afin de permettre leurs traitement car les données json sont des chaines
        return jsonTweets.tweets;
    } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
        return [];
    }
}
//Fonction permettant d'écrire dans le fichier  users JSON
function writeDataToFile(data) {
    try {
        const allData = { ...readDataFromFile(dataPath), ...data }; // Fusionne les données existantes avec les nouvelles données
        fs.writeFileSync(dataPath, JSON.stringify(allData, null, 2), 'utf8'); // Écrit toutes les données dans le fichier
    } catch (error) {
        console.error("Erreur lors de l'envoi des données", error);
    }
}




//Routes pour les tweets

//Récupération des données
app.get('/api/tweet', (req, res) => {
    const tweet = readTweetsDataFile();
    res.json(tweet);
});

// // Ajout des données ou écriture dans le fichier
app.post('/api/tweet', (req, res) => {
    const tweet = req.body;;
    const tweetData = readTweetsDataFile();
    //récupération du plus grand id de tous les données dans le fichiers json du serveur
    const maxId = tweetData.reduce((max,tweet)=>Math.max(max,tweet.id),0);
        //ajout de la propriété id dans tweet
    tweet.id = maxId +1;

    tweetData.push(tweet);
    writeDataToFile({ tweets: tweetData });
    res.status(201).json(tweetData);
});

// // Mise à jour
app.put('/api/tweet/:id', (req, res) => {
    const { id } = req.params;
    const newData = req.body;
    const tweetData = readTweetsDataFile();
    
    //on utilise findIndex car les objects javascripts sont comparées référence et non par valeur 
    const index = tweetData.findIndex(tweet => tweet.id === parseInt(id));
    if (index !== -1) { // si l'élément n'est pas trouvé findIndex renverra -1 
        tweetData[index] = newData;
        writeDataToFile(tweetData);
        res.send({ message: "Mise à jour réussie" });
    } else {
        res.status(404).send({ message: "Données introuvables" });
    }
});

// Supprimer les données
app.delete('/api/tweet/:id', (req, res) => {
    const { id } = req.params;
    const tweetData = readTweetsDataFile();
    const index = tweetData.findIndex(tweet => tweet.id === parseInt(id));
    if (index !== -1) {
        tweetData.splice(index, 1);
        writeDataToFile(tweetData);
        res.send({ message: "Supprimé avec succès" });
    } else {
        res.status(404).send({ message: "Données introuvables" });
    }
});


// Routes des Users
// Récupération des données des users
app.get('/api/users', (req, res) => {
    const users = readUsersDataFile();
    res.json(users);
});

// Ajout des données ou écriture dans le fichier
app.post('/api/users', (req, res) => {
    const users = req.body;
    const usersData = readUsersDataFile();
    usersData.push(users);
    writeDataToFile({users:usersData});
    res.status(201).json(usersData);
    res.send({ message: "données ajoutées avec succés" });

});

// Mise à jour
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const newData = req.body;
    const usersData = readUsersDataFile();
    
    //on utilise findIndex car les objects javascripts sont comparées référence et non par valeur 
    const index = usersData.findIndex(users => users.id === parseInt(id));
    if (index !== -1) { // si l'élément n'est pas trouvé findIndex renverra -1 
        usersData[index] = newData;
        writeDataToFile(usersData);
        res.send({ message: "Mise à jour réussie" });
    } else {
        res.status(404).send({ message: "Données introuvables" });
    }
});

// Supprimer les données
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const usersData = readUsersDataFile();
    const index = usersData.findIndex(users => users.id === parseInt(id));
    if (index !== -1) {
        usersData.splice(index, 1);
        writeDataToFile(usersData);
        res.send({ message: "Supprimé avec succès" });
    } else {
        res.status(404).send({ message: "Données introuvables" });
    }
});


app.listen(PORT, () => {
    console.log("Votre serveur est lancé correctement sur le port :", PORT);
});


