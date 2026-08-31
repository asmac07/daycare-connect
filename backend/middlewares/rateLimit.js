
const rateLimit = require("express-rate-limit");

// auth api
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many authentication attempts. Please try again after 15 minutes."
    }
})

    //for general api
//  const apiLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//     standardHeaders: true,
//     legacyHeaders: false,

//     message: {
//         success: false,
//         message: "Too many requests. Please try again later."
//     }
// })
//     // search api
//  const searchLimiter = rateLimit({
//     windowMs: 1 * 60 * 1000,
//     max: 30,
//     standardHeaders: true,
//     legacyHeaders: false,

//     message: {
//         success: false,
//         message: "Too many search requests. Please wait a moment."
//     }
// })

module.exports = { 
                authLimiter ,
                // apiLimiter,
                // searchLimiter
                 }