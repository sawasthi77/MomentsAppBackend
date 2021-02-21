const mongoose = require('mongoose');

const PropertiesSchema = mongoose.Schema({
    maxImageId: {
        type: String
    },
    maintDt: {
        type: Date
    }
});

const Properties = module.exports = mongoose.model
('Properties', PropertiesSchema);

module.exports.getProperties = function(callback){
    Properties.find().exec(callback);
}

module.exports.updMaxImageId = function(maxImageId,
    properties_id, callback){        
    Properties.findOneAndUpdate({ _id: properties_id }, 
        { $set: { 'maxImageId': maxImageId }}).exec(callback);  
}