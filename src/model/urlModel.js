const mongose = require("mongoose")



const urlSchema = new mongose.Schema({

    urlCode: { 
        type: String,
         required: 'url required',
        unique: true, 
        lowercase: true,
        trim : true
    },

    longUrl: {
        type: String,
        required:true, 
         unique:true
    },

    shortUrl:{
        type : String,
         required:'shorturl is required',
        unique:true
    }
},{timestamps: true})    

module.exports = mongose.model('url',urlSchema)


