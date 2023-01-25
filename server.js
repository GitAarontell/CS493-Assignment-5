const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routerBoats = require('./boatRoutes');


app.enable('trust proxy');
app.use(bodyParser.json());

app.use('/boats', routerBoats);



// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});