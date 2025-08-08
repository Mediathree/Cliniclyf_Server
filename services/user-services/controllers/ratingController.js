const Joi = require("joi");
const Rating = require("../../../models/rating");

const ratingController = {
    createRating: {
        validation: Joi.object({
            reviewable_id: Joi.string().required(),
            user_id: Joi.string().optional(),
            rating: Joi.number().required(),
            review: Joi.string().required(),
        }),
        handler: async (req, res) => {
            try {
                const { reviewable_id, user_id, rating, review } = req.body;

                const data = await Rating.create({ reviewable_id, user_id, rating, review })

                res.status(201).json({ success: true, message: "Rating created successfully", data: data });
            } catch (error) {
                console.log(error.message)
                res.status(500).json({ success: false, message: "Internal server error", error: error.message });
            }
        },
    }
}

module.exports = ratingController;