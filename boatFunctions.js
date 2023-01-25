const ds = require('./cloudDatastore');
const datastore = ds.datastore;
const BOAT = ds.BOAT;
const fromDatastore = ds.fromDatastore;

function get_boats(req) {
    let q = datastore.createQuery(BOAT);
    const results = {};   
    return datastore.runQuery(q).then((entities) => {
        results.items = entities[0].map(fromDatastore);
        return results;
    });
}

function get_boat(id) {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    return datastore.get(key).then((entity) => {
        if (entity[0] === undefined || entity[0] === null) {
            return entity;
        } else {
            console.log(entity);

            return entity.map(fromDatastore);
        }
    });
}


function post_boat(req, name, type, length) {
    let key = datastore.key(BOAT);
    return datastore.save({ "key": key, "data": "" }).then(() => {
        let self = req.protocol + "://" + req.get("host") + req.baseUrl + '/' + key.id;
        const new_boat = {"name": name, "type": type, "length": length, "self": self};
        return put_boat(key.id, new_boat).then(() => {
            new_boat.id = key.id;
            return new_boat});
    });
}

function put_boat(id, data) {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    //const was_data_before = { "name": name, "type": type, "length": length };
    return datastore.save({ "key": key, "data": data });
}

function delete_boat(id) {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    return datastore.delete(key);
}

function checkIfNameExists(name, boats) {
    for(let i = 0; i < boats.length; i++){
        if (boats[i].name == name){
            return true;
        }
    }
    return false;
}

function inputValidation(body){
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?~]/;
    if ("name" in body){
        if (body.name.length > 30 || typeof body.name !== 'string' || specialChars.test(body.name)){
            return true;
        }
    }
    if ("type" in body){
        if (body.type.length > 30 || typeof body.name !== 'string' || specialChars.test(body.type)){
            return true;
        }
    }
    if ("length" in body){
        if (body["length"].length > 30 || typeof body.name !== 'string' || specialChars.test(body.length)){
            return true;
        }
    }
    return false;
}

module.exports = {get_boats, get_boat, post_boat, put_boat, delete_boat, checkIfNameExists, inputValidation}