const urlModel = require("../model/urlModel")

const validUrl = require('valid-url')
const shortid = require('shortid')


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
        // if (!validUrl.is_https_uri(baseUrl)) {
        //     res.status(400).send({ status: false, msg: "Please enter Correct BaseURL" })
        //     return
        // }


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
        return res.status(400).send({status:true,message:'alredy registrd url',data:checkurl})
        }
        let savedData = await urlModel.create(data)

        return res.status(200).send({ status: true, msg: "Succesfully Created", data: savedData })


    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: error.message })
    }

}


const redirect = async function(req,res){
    
    try {
        let urlCode =req.params.urlCode
        
        const url = await urlModel.findOne({urlCode})
        if (url) {
            // when valid we perform a redirect
            console.log(url.longUrl)
            return res.status(302).redirect(url.longUrl)
        } else {
             return res.status(404).send({status:false,message:'No URL Found'})
        }
    }catch (err) {
        
        res.status(500).send({status:false,message:'err.message'})
    }
}

   
    



module.exports.createUrl = createUrl;
module.exports.redirect = redirect;
