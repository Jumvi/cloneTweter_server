const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Chemin vers nos données


const initialDataPath = './assets/initial-data.json';
const dataPath = './assets/data.json';

const existDataPath = fs.existsSync(dataPath);

// verification si le chemin dataPath existe déjà afin de le créer pour éviter des rédondance à chaque lancement
if(!existDataPath){
    //lecture des données initial
    const initialData = JSON.parse(fs.readFileSync(initialDataPath, 'utf8'));

    //écriture des données initailes dans data.json

    //avec json.stringify qui permet des traduire les object en chaine json
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));

}

// Fonction qui permet de lire les données du fichier JSON
function readDataFile() {
    try {
        const tweetData = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(tweetData); // Convertir la chaîne JSON en objet JavaScript afin de permettre leurs traitement car les données json sont des chaines
    } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
        return [];
    }
}

// Fonction permettant d'écrire dans le fichier JSON
function writeDataToFile(data) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Erreur lors de l'envoi des données", error);
    }
}

// Routes

// Récupération des données
app.get('/api/tweet', (req, res) => {
    const tweet = readDataFile();
    res.json(tweet);
});

// Ajout des données ou écriture dans le fichier
app.post('/api/tweet', (req, res) => {
    const tweet = req.body;
    const tweetData = readDataFile();
    tweetData.push(tweet);
    writeDataToFile(tweetData);
    res.status(201).json(tweetData);
    res.send({ message: "données ajoutées avec succés" });

});

// Mise à jour
app.put('/api/tweet/:id', (req, res) => {
    const { id } = req.params;
    const newData = req.body;
    const tweetData = readDataFile();
    
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
    const tweetData = readDataFile();
    const index = tweetData.findIndex(tweet => tweet.id === parseInt(id));
    if (index !== -1) {
        tweetData.splice(index, 1);
        writeDataToFile(tweetData);
        res.send({ message: "Supprimé avec succès" });
    } else {
        res.status(404).send({ message: "Données introuvables" });
    }
});

app.listen(PORT, () => {
    console.log("Votre serveur est lancé correctement sur le port :", PORT);
});
