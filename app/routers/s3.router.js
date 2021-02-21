let express = require('express');
let router = express.Router();
const mongoose = require('mongoose');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const db = "mongodb://localhost:27017/momentsAppDB";
const Properties = require('../model/properties');
const Images = require('../model/images');
const env = require('../config/s3.env');
const s3Bucket = new AWS.S3({ accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
});
 
const upload = require('../config/multer.config.js');

const awsWorker = require('../controllers/s3.controller.js');

mongoose.connect(db, function(err){
    if(err){
        console.log('Error!' + err);
    }
    else{
        console.log('Connected to mongoDb');
    }
});

router.post('/register', (req, res) => {
    let userData = req.body
    let user = new User(userData)
    user.save((err, registeredUser) =>{
        if(err){
            console.log(err)
        }
        else{
            let payload = {subject: registeredUser._id}
            let token = jwt.sign(payload, 'secretKey')
            res.status(200).send({token})
        }
    })
})


router.post('/login', (req, res) => {
    let userData = req.body
    User.findOne({email: userData.email}, (err, user) => {
        if(err){
            console.log(err)
        }
        else{
            if(!user){
                res.status(401).send('Invalid Email')
            }else if(user.password != userData.password){
                    res.status(401).send('Invalid Password');
                }
            else {
                let payload = {subject: user._id}
                let token = jwt.sign(payload, 'secretKey')
                res.status(200).send({token});
            }
        }
    })
})
 
//router.post('/api/files/upload', upload.single("file"), awsWorker.doUpload);

router.post('/api/files/upload', upload.single("file"), (req, res) => {
    Properties.getProperties((err, properties) => {
        if(err){
            console.log(err);
                return res.json({success: false, msg: err});
        }
        else if(!properties){
            return res.json({success: false, msg: 'No properties!'});
        }
        else{
            let maxImageId = properties[0].maxImageId;
            let properties_id = properties[0]._id;
            maxImageId = +maxImageId + 1;                      
            Properties.updMaxImageId(''+maxImageId, 
           properties_id, (err, properties) => {
               if(err){
                   console.log(err);                  
               } else {
                   const imgUrl = 
                   'https://s3.amazonaws.com/storemoments/'+maxImageId+'.jpg';
                   const image = new Images({
                       imageId: maxImageId,
                       imageName: req.file.originalname,
                       imagePath: imgUrl,
                       maintDt: Date.now() 
                   });


                Images.addImage(image, (err, image)=>{                      
                    if(req.file !== null && req.file !==undefined){
                    //if(req.file.value !== undefined){
                    //const buf = new Buffer.alloc(req.file.value.replace(/^data:image\/\w+;base64,/, ""),'base64');
                    const params = {
                        Bucket: 'storemoments',
                        Key: ''+image.imageId+'.jpg', 
                        Body: req.file.buffer,
                        ACL: 'public-read',
                        ContentType: 'image'
                    };
                    s3Bucket.upload(params, function(err, data){
                    if (err) { 
                    console.log(err);
                    return res.json({success: false, msg: 'Failed to upload image. }'});
                            } 
                    else{
                        res.json({success: true, msg: 'Image Uploaded to S3'});  
                    }
                                    });
                            }                                                      
                    });
       }

 });
}
})
    
});


router.get('/api/files/all',(req, res) => {   
    Images.getImages((err, images)=>{
        if(err){
            console.log(err);
        }      
        else{
            console.log(images);
            res.json(images);
        }
    });
});

router.post('/api/files/deleteImage', (req, res, next) => {
    Images.deleteImage(req.body.imageId, (err, image) => {
        if(err){
            res.json({success: false, msg: err});
        } else {           
            const params = {
                Bucket: 'storemoments',               
                Key: ''+req.body.imageId+'.jpg', 
            };
            s3Bucket.deleteObject(params, function(err, data){
                if (err) { 
                    console.log(err);
                    return res.json({success: false, msg: err});                    
                } 
            });  
            res.json({success: true, msg: 'Image deleted from S3'});
        }
    });    
});

//router.get('/api/files/all', awsWorker.listKeyNames);

router.get('/api/files/:filename', awsWorker.doDownload);

router.post('/api/files/:filename', awsWorker.doDelete);

module.exports = router;