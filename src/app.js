const express = require('express');
const helmet = require('helmet');
const expressSanitizer = require('express-sanitizer');
const cookieParser = require('cookie-parser');
const requestIp = require('request-ip');
const cors = require('cors');
const { requestResponseLogger } = require('./utils/logger.js');
const router = require('./routes/index.js');
const errorHandlers = require('./utils/serverErrorHandlers.js');

require('./services/mongodbConn');
require('./models/User');

const app = express();
const env = process.env.NODE_ENV || 'development';
const helmetOptions = { hsts: env === 'production' };

const corsOptionsDelegate = (_, cb) => {
  let corsOptions;
  if (env === 'development') {
    corsOptions = {
      origin: 'http://localhost:3000',
      credentials: true, // <-- REQUIRED backend setting
    };
  } else {
    corsOptions = {
      origin: true,
    };
  }
  cb(null, corsOptions);
};

app.set('env', env);
app.set('host', process.env.HOST);
app.set('port', process.env.PORT);
app.set('trust proxy', 1); // specify a single subnet
app.use(cors(corsOptionsDelegate));
app.use(requestResponseLogger);
app.use(helmet(helmetOptions));
app.use(requestIp.mw());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressSanitizer());

app.use(router);
app.use(...errorHandlers);

module.exports = app;
