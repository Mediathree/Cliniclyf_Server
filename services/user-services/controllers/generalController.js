const Joi = require("joi");

const User = require("../../../models/user");
const Address = require("../../../models/address");
const Photo = require("../../../models/photo");
const Rating = require("../../../models/rating");
const Service = require("../../../models/service");

const generalController = {
    getEntity: {
        validation: Joi.object({
            role: Joi.string().required(),
            id: Joi.string().required()
        }),

        handler: async (req, res) => {
            try {
                let data;

                if (role === "doctor") {
                    data = await Doctor.findByPk(id, {
                        include: [
                            {
                                model: User,
                                where: query,
                                include: [
                                    {
                                        model: Address,
                                        attributes: ['city', 'state'],
                                        required: false
                                    },
                                    {
                                        model: Photo,
                                        attributes: ['url'],
                                        required: false
                                    },
                                    {
                                        model: Rating,
                                        as: "receivedBy",
                                        required: false
                                    }
                                ],

                            },
                            {
                                model: User,
                                as: 'clinic', // alias matches the association
                                attributes: ['id', 'name', 'email'], // choose what clinic data you want
                                required: false
                            }
                        ]
                    });
                } else if (role === "clinic") {
                    data = await Clinic.findByPk(id, {
                        include: [
                            {
                                model: User,
                                include: [
                                    {
                                        model: Address,
                                        attributes: ['city', 'state'],
                                        required: false
                                    },
                                    {
                                        model: Photo,
                                        attributes: ['url'],
                                        required: false
                                    },
                                    {
                                        model: Rating,
                                        as: "receivedBy", // ✅ specify alias here
                                        required: false,
                                        include: [
                                            {
                                                model: User,
                                                as: "givenBy",
                                                attributes: ['id', 'name', 'email'],
                                                include: [
                                                    {
                                                        model: Photo,
                                                        attributes: ['url']
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        model: Service,
                                        attributes: ['id', 'title', 'description'],
                                        required: false
                                    }
                                ]
                            }
                        ]
                    });
                }

                res.status(201).json({ success: true, message: "Fetched Entity details successfully", data });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server error", error: error.message });
            }
        },
    },
}

module.exports = generalController;