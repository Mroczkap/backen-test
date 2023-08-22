const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: (origin, callback) => {
        callback(null, allowedOrigins)
    //     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            
    //     } else {
    //         callback(new Error('Not allowed by CORS'));
    //     }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;