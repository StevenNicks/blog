require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const { clientUrls, isOriginAllowed } = require('./utils/allowedOrigins');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
// CLIENT_URL admite varios orígenes separados por coma y comodines por segmento (p. ej. http://192.168.1.*:3000)
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || !clientUrls().length || isOriginAllowed(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', limiter);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
