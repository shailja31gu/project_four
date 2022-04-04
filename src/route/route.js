const express = require("express")

const urlController = require("../controller/urlController")

const router = express.Router()

router.get("/test", (req, res) => {
    res.status(301).redirect("https://github.com/Rohan7050/project_four/tree/project/urlShortnerGroup45")
})


module.exports = router