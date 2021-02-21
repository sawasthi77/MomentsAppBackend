const s3 = require('../config/s3.config.js');
const env = require('../config/s3.env.js');
 
exports.doUpload = (req, res) => {
	const params = {
		Bucket: env.Bucket,
		Key: req.file.originalname,
		Body: req.file.buffer
	}
	
	s3.upload(params, (err, data) => {
		if (err) {
			res.status(500).send("Error -> " + err);
		}
		res.send("File uploaded successfully! -> keyname = " + req.file.originalname);
	});
}

exports.listKeyNames = (req, res) => {
	const params = {
		Bucket: env.Bucket
	}

	var keys = [];
	s3.listObjectsV2(params, (err, data) => {
        if (err) {
			console.log(err, err.stack); // an error occurred
			res.send("error -> "+ err);
        } else {
            var contents = data.Contents;
            contents.forEach(function (content) {
                keys.push(content.Key);
			});
			res.send(keys);
		}
	});
}

exports.doDownload = (req, res) => {
	const params = {
		Bucket: env.Bucket,
		Key: req.params.filename
	}

	res.setHeader('Content-Disposition', 'attachment');

	s3.getObject(params)
		.createReadStream()
			.on('error', function(err){
				res.status(500).json({error:"Error -> " + err});
		}).pipe(res);
}


exports.doDelete = (req, res) => {
	const params = {
		Bucket: env.Bucket,
		Key: req.params.filename
	}

	s3.deleteObject(params, (err, data) =>{
		if(err){
			console.log(err);
		}else{
			console.log(data);
			res.send(data);
		}
	});


exports.newUpload = (req, res) => {
	Properties.getProperties((err, properties) => {
        if(err){
            console.log(err);
                res.send(err)
        }
        else if(!properties){
            res.send('No error properties')
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
                     res.send(err);
                            } 
                    else{
                        res.send("File uploaded successfully! -> keyname = " + req.file.originalname); 
                    }
                                    });
                            }                                                      
                    });
       }

 });
}
})
}	
}