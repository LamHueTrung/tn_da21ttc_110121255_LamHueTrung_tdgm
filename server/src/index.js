const path = require('path');
const express = require('express');
const morgan = require('morgan');
const route = require('./routes/index.route');
const connectDB = require('./app/database'); 
const app = express();
const port = 3000;

// Kết nối tới MongoDB
connectDB();

//Đinh tuyến đường dẫn file tĩnh
app.use(express.static(path.join(__dirname, 'public')));  

//Middleware
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

// Http logger
app.use(morgan('combined'));

// Route
route(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})