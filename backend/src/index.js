const dotenv = require("dotenv")
dotenv.config();
const app = require("./app")
const paymentDatabase = require("./config/db")   

const port = process.env.PORT || 8080;


paymentDatabase();

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`)
})