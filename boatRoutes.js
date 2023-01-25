const express = require('express');
const routerBoats = express.Router();
const boatfunc = require('./boatFunctions');
const { Datastore } = require('@google-cloud/datastore');
const ds = require('./cloudDatastore');

routerBoats.get('/', function (req, res) {
    const boats = boatfunc.get_boats(req)
        .then((boats) => {
            let boatArray = boats.items;
            let retObj = {"boats": boatArray};            
            res.status(200).json(retObj);
        });
});

routerBoats.get('/:id', function (req, res) {

    if(req.get('accept') !== 'application/json' && req.get('accept') !== 'text/html'){
        res.status(406).send({"Error": "Server can only send application/json or text/html data"});
    }

    boat_id = req.params.id;
    boatfunc.get_boat(boat_id)
        .then(boatArray => {
            let boat = boatArray[0]
            if (boat === undefined || boat === null) {
                res.status(404).json({'Error':'No boat with this boat_id exists'});
            }
            
            if (req.get('accept') == 'application/json'){
                res.status(200).json(boat);
            } else if (req.get('accept') == 'text/html') {
                res.set('content-type', 'text/html');
                res.status(200).json(`<ul><li>${boat.id}</li><li>${boat.name}</li><li>${boat.type}</li><li>${boat.length}</li><li>${boat.self}</li></ul>`);
            }
        });
});

routerBoats.get('/:id/loads', function(req, res) {
    boatfunc.get_boat(req.params.id).then((boatArray) => {
        let boat = boatArray[0];
        if (boat === undefined || boat === null){
            res.status(404).send({"Error":"No boat with this boat_id exists"});
        } else {
            res.status(200).send(boat);
        }
    });
});

routerBoats.post('/', function (req, res) {
    // checks if client is sending json
    if(req.get('content-type') !== 'application/json'){
        res.status(415).send({"Error": "Server only accepts application/json data"})
    }
    // checks if accepts json data
    if (req.get('accept') !== 'application/json'){
        res.status(406).send({"Error": "Server can only send application/json data"})
    }
    else if (Object.keys(req.body).length == 3) {

        // check for correct attribute keys
        let keys = Object.keys(req.body);
        if (JSON.stringify(keys) !== JSON.stringify(['name', 'type', 'length'])) {
            res.status(400).send({"Error": "The request object is missing at least one of the required attributes or the attributes are not set in the right order"});
        }
        // check input are strings and less than 30 characters
        if (boatfunc.inputValidation(req.body)) {
            res.status(400).send({"Error": "String length greater than 30 characters or not of datatype string, or symbols are in the string"});
        }

        //res.set('content-type', 'application.json');
        boatfunc.post_boat(req, req.body.name, req.body.type, req.body.length)
            .then(boat => {
                res.status(201).send(boat);
            });
    } else {
        res.status(400).send({"Error": "The request object is missing at least one of the required attributes"});
    }
});

routerBoats.put('/:id', function (req, res) {

    let keys = Object.keys(req.body);
    // checks if request is sending json
    if(req.get('content-type') !== 'application/json'){
        res.status(415).send({"Error": "Server only accepts application/json data"})
    }
    // checks if there are only 3 attributes
    if (keys.length != 3) {
        res.status(400).send({"Error": "The request object is missing at least one of the required attributes"});
    } 
    // checks if the attributes have the right key names and are in the right order
    if (JSON.stringify(keys) !== JSON.stringify(['name', 'type', 'length'])) {
        res.status(400).send({"Error": "The request object is missing at least one of the required attributes or the attributes are not set in the right order"});
    }

    // check input are strings and less than 30 characters
    if (boatfunc.inputValidation(req.body)) {
        res.status(400).send({"Error": "String length greater than 30 characters or not of datatype string, or symbols are in the string"});
    }

    // check if name exists
    boatfunc.get_boats().then((boats) => {
        let boatArray = boats.items;
        if (boatfunc.checkIfNameExists(req.body.name, boatArray)) {
            res.status(403).send({"Error": "Name already taken"});
        }
    });
    let id = req.params.id;

    boatfunc.get_boat(id).then((boatArray) => {
        let boat = boatArray[0];
        if (boat === undefined || boat === null){
            res.status(404).send({"Error": "The specified boat does not exist"});
        }
        boat["name"] = req.body.name;
        boat["type"] = req.body.type;
        boat["length"] = req.body.length;

        boatfunc.put_boat(id, boat).then( ()=> {
            res.set("location", boat.self).status(303).send(boat);
        });
    });                      
});

routerBoats.patch('/:id', function (req, res) {

    let keys = Object.keys(req.body);
    // checks if request is sending json
    if(req.get('content-type') !== 'application/json'){
        res.status(415).send({"Error": "Server only accepts application/json data"})
    }
    // checks if there are only 3 attributes
    if (keys.length > 3) {
        res.status(400).send({"Error": "No more than 3 attributes allowed"});
    }

    // check if name exists
    if("name" in req.body){
        boatfunc.get_boats().then((boats) => {
            let boatArray = boats.items;
            if (boatfunc.checkIfNameExists(req.body.name, boatArray)) {
                res.status(403).send({"Error": "Name already taken"});
            }
        });
    }
    let id = req.params.id;

    boatfunc.get_boat(id).then((boatArray) => {
        let boat = boatArray[0];
        if (boat === undefined || boat === null){
            res.status(404).send({"Error": "The specified boat does not exist"});
        
        } else if (boatfunc.inputValidation(req.body)) {
            res.status(400).send({"Error": "String length greater than 30 characters or not of datatype string, or symbols are in the string"});
            
        } else {
            // update attribute if it was input in the body
            if ("name" in req.body){boat["name"] = req.body.name;}
            if ("type" in req.body){boat["type"] = req.body.type;}
            if ("length" in req.body){boat["length"] = req.body.length;}

            boatfunc.put_boat(id, boat).then(()=> {
                res.set("location", boat.self).status(200).send(boat);
            });
        }
    });                      
});

routerBoats.delete('/:id', function (req, res) {
    boatfunc.get_boat(req.params.id).then((boatArray) => {
        let boat = boatArray[0];
        if (boat === undefined || boat === null){
            res.status(404).send({"Error": "No boat with this boat_id exists"});
        }
        // delete boat
        boatfunc.delete_boat(req.params.id).then(
            res.status(204).end())
        });
});

routerBoats.delete('/', function (req, res){
    res.set('Accept', 'GET, POST');
    res.status(405).end();
});

routerBoats.put('/', function (req, res){
    res.set('Accept', 'GET, POST');
    res.status(405).end();
});

module.exports = routerBoats;