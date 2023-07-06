const express = require('express')
const { bot } = require('./bot.js')

const app = express()
const port = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.send("Holla iniciaste el Bot")
    bot()
})

app.listen(port, () => {
    console.log("Server on port:", port)
})
