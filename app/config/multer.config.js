const multer = require('multer');
 
var storage = multer.memoryStorage(
    {
        destination: function(req, file, callback){
            callback(null, '')
        }
    });
var upload = multer({storage: storage});
 
module.exports = upload;