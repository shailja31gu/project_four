const urlModel = require("../model/urlModel")
const redis = require('redis')
const validUrl = require('valid-url')
const shortid = require('shortid')

const { promisify } = require("util");

const redisClient = redis.createClient(
    18489,
   'redis-18489.c264.ap-south-1-1.ec2.cloud.redislabs.com',
   { no_ready_check: true }
    
);
redisClient.auth("AirDa1mm47wNAzWTdol3HyNFqXbG3XsM", function (err){
    if (err) throw err;
});

redisClient.on("connect", async function(){
    console.log("connected to redis..");
});
//return function as a promise
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}


const createUrl = async function(req, res) {
    try {
        let data = req.body
        if (!isValidRequestBody(data)) {
            res.status(400).send({ status: false, msg: "please provide details to moveahead" })
            return
        }
        const baseUrl = 'http:localhost:3000'
        
        const { longUrl } = data // object distructing done so that we can do validation


        if (!isValid(longUrl)) {
            res.status(400).send({ status: false, msg: "LongUrl Is Required" })
            return
        }
       
        const urlCode = shortid.generate().toLocaleLowerCase()

        if (!validUrl.is_https_uri(longUrl)) {
            res.status(400).send({ status: false, msg: "Please Provide Valid URL" })
            return
        }

        const shortUrl = baseUrl + '/' + urlCode
        const longurl = data
        data.shortUrl=  shortUrl
        data.urlCode = urlCode
    
        // if alredy used longUrl then return data of that longurl
        let checkurl = await urlModel.findOne({longUrl:data.longUrl})
        if(checkurl){
        return res.status(200).send({status:true,message:'alredy registrd url',data:checkurl})
        }
        let savedData = await urlModel.create(data)

        return res.status(201).send({ status: true, msg: "Succesfully Created", data: savedData })

        
        

    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: error.message })
    }

}


const redirectToUrl = async function(req,res){
    
    try {
        let urlCode =  req.params.urlCode
        
        if (!shortid.isValid(urlCode)){
            return res.status(400).send({status: false, message: "this is not a valid url"})
        }
           let checkRedisdata = await GET_ASYNC(`${urlCode}`)
           if(checkRedisdata){
               console.log("data from caches")
               const data = JSON.parse(checkRedisdata)
               return res.status(302).redirect(data.longUrl)
           }else
   
           {
           let urlPresent = await urlModel.findOne({urlCode: urlCode})
           if (!urlPresent){
            return res.status(404).send({status:false,message:"url not present"})
           }
            await SET_ASYNC(`${urlCode}`, JSON.stringify(urlPresent))
           
               console.log("data from mongo")
               
               return res.status(302).redirect(urlPresent.longUrl)
            }
   }catch (err) {
        
        res.status(500).send({status:false,message:err.message})
    }
}

   
module.exports.createUrl = createUrl;
module.exports.redirectToUrl = redirectToUrl;
