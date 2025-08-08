const parseServicesMiddleware = (req, res, next) => {
    try {
        if (req.body.services && typeof req.body.services === "string") {
            req.body.services = JSON.parse(req.body.services);
        }
        next();
    } catch (err) {
        return res.status(400).json({
            message: "Invalid format for 'services'. It must be a valid JSON array.",
        });
    }
};

module.exports = parseServicesMiddleware