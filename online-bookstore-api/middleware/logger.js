// Middleware to log each request (method, endpoint, date/time)
const logger = (req, res, next) => {
    const method = req.method;
    const url = req.originalUrl;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${method} request to ${url}`);
    next();
};

module.exports = logger;
