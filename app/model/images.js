const mongoose = require('mongoose');

const ImagesSchema = mongoose.Schema({
    imageId: {
        type: String
    },
    imageName: {
        type: String
    },
    imagePath: {
        type: String
    },
    maintDt: {
        type: Date
    }
});

const Images = module.exports = mongoose.model('Images', ImagesSchema);

module.exports.getImages = function(callback){
    Images.find().sort('-maintDt').exec(callback);
}

module.exports.addImage = function(data, callback){    
    var newImage = new Images(data);
    newImage.save(callback);  
}

module.exports.deleteImage = function(imageId, callback){        
    Images.findOneAndRemove({ imageId: imageId }).exec(callback);  
}