const { Datastore } = require('@google-cloud/datastore');
module.exports = Datastore;
module.exports.datastore = new Datastore();
module.exports.BOAT = "Boat";

module.exports.fromDatastore = function fromDatastore(item) {
    item.id = item[Datastore.KEY].id;
    return item;
};