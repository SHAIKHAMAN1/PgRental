import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDB from './config/db.js';
import userRouter from './Routes/userRoutes.js';
import ownerRouter from './Routes/ownerRoutes.js';
import bookingRouter from './Routes/bookingRouter.js';
const app = express()
const PORT = 3000

await connectDB();


 



//middlewares

app.use(cors());
app.use(express.json())


app.get('/',(req,res)=>{   
    res.send("Hello World")
}) 

app.use('/api/user',userRouter)
app.use('/api/owner',ownerRouter)
app.use('/api/booking',bookingRouter)
 
app.listen(PORT,()=>{
     console.log(`Example app listening on port ${PORT}`)
}) 