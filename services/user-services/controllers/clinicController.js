const Joi = require("joi");
const Clinic = require("../../../models/clinic");
const Address = require("../../../models/address");
const Service = require("../../../models/service");
const Photo = require("../../../models/photo");
const User = require("../../../models/user");
const Subscription = require("../../../models/subscription");
const Rating = require("../../../models/rating");
const { sendEmail } = require("../../emailService");

const clinicController = {
    createClinic: {
        validation: Joi.object({
            user_id: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            overview: Joi.string().required(),
            services: Joi.any()
        }),

        handler: async (req, res) => {
            try {
                const { user_id, city, state, overview, services } = req.body;

                const clinicExists = await Clinic.findOne({ where: { user_id } });
                if (clinicExists) return res.status(400).json({ success: false, message: "Clinic already exists", data: null });

                const clinic = await Clinic.create({ user_id, overview });

                if (clinic) {
                    await Address.create({ user_id, city, state });

                    if (req.file) {
                        await Photo.create({ photoable_id: user_id, url: req.file.path, name: req.file.originalname });
                    }

                    for (let service of services) {
                        await Service.create({ user_id, title: service.title, description: service.description })
                    }
                }

                return res.status(201).json({ success: true, message: "Clinic created successfully", clinic });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Update a clinic
    updateClinic: {
        validation: Joi.object({
            user_id: Joi.string().required(),
            photo: Joi.string().optional(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            overview: Joi.string().required(),
            services: Joi.any()
            // services: Joi.array().items(Joi.object({ id: Joi.string().optional(), title: Joi.string().required(), description: Joi.string().required() })),
        }),

        handler: async (req, res) => {
            try {
                const { user_id, city, state, overview } = req.body;
                let { services } = req.body;

                await Clinic.update({ overview }, {
                    where: {
                        user_id
                    }
                });

                await Address.update({ city, state }, {
                    where: {
                        user_id
                    }
                });

                if (req.file) {
                    await Photo.update({ url: req.file.path, name: req.file.originalname }, {
                        where: {
                            photoable_id: user_id
                        }
                    });
                }

                // Step 1: Fetch existing services from DB
                const existingServices = await Service.findAll({ where: { user_id } });

                // Step 2: Extract incoming service IDs (existing only)
                const incomingServiceIds = services
                    .filter(service => service.id)
                    .map(service => service.id);


                // Step 3: Delete removed services
                const servicesToDelete = existingServices.filter(
                    service => !incomingServiceIds.includes(service.id)
                );

                for (const service of servicesToDelete) {
                    await service.destroy();
                }

                // Step 4: Upsert the incoming services
                for (const service of services) {
                    await Service.upsert({
                        user_id,
                        id: service.id, // undefined for new, used for existing
                        title: service.title,
                        description: service.description
                    });
                }

                return res.status(200).json({ success: true, message: "Clinic updated successfully", data: null, error: null });
            } catch (error) {
                console.error(error.message);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Get all clinics
    getClinics: {
        handler: async (req, res) => {
            try {
                const clinics = await Clinic.findAll({
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

                return res.status(200).json({ success: true, message: "Clinics fetched successfully", data: clinics });
            } catch (error) {
                console.error(error.message);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Get a specific clinic by ID
    getClinicById: {
        validation: Joi.object({
            id: Joi.string().uuid().required(),
        }),

        handler: async (req, res) => {
            try {
                const { id } = req.params;

                const clinic = await Clinic.findByPk(id);
                if (!clinic) return res.status(404).json({ message: "Clinic not found" });

                return res.status(200).json({ clinic });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    activateClinic: {
        handler: async (req, res) => {
            try {
                const { clinicId } = req.query;

                const clinic = await Clinic.findByPk(clinicId);
                if (!clinic) return res.status(404).json({ message: "Clinic not found" });

                clinic.status = "active"
                await clinic.save();

                return res.status(200).json({
                    success: true, message: "Clinic Approved Successfully", data: null, error: null
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    deactivateClinic: {
        handler: async (req, res) => {
            try {
                const { clinicId } = req.query;

                const clinic = await Clinic.findByPk(clinicId);
                if (!clinic) return res.status(404).json({ message: "Clinic not found" });

                clinic.status = "inactive"
                await clinic.save();

                return res.status(200).json({
                    success: true, message: "Clinic Deactivated Successfully", data: null, error: null
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    // Delete a clinic    
    deleteClinic: {
        validation: Joi.object({
            id: Joi.string().uuid().required(),
        }),

        handler: async (req, res) => {
            try {
                const { id } = req.params;

                const clinic = await Clinic.findByPk(id);
                if (!clinic) return res.status(404).json({ message: "Clinic not found" });

                await clinic.destroy();

                return res.status(200).json({ message: "Clinic deleted successfully" });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Register a clinic for medical billing
    billingRegister: {
        validation: Joi.object({
            clinicName: Joi.string().required().messages({
                "string.base": "Clinic name must be a string.",
                "string.empty": "Clinic name is required.",
                "any.required": "Clinic name is required.",
            }),
            contactPerson: Joi.string().required().messages({
                "string.base": "Contact person name must be a string.",
                "string.empty": "Contact person name is required.",
                "any.required": "Contact person name is required.",
            }),
            email: Joi.string().email().required().messages({
                "string.base": "Email must be a string.",
                "string.empty": "Email is required.",
                "string.email": "Email must be a valid email address.",
                "any.required": "Email is required.",
            }),
            phone: Joi.string()
                .pattern(/^[1-9][0-9]{9}$/)
                .required()
                .messages({
                    "string.pattern.base": "Phone must be a valid 10-digit number.",
                    "string.empty": "Phone number is required.",
                    "any.required": "Phone number is required.",
                }),
            plan: Joi.string()
                .valid("basic", "pro")
                .required()
                .messages({
                    "any.only": "Plan must be either 'basic' or 'pro'.",
                    "any.required": "Plan selection is required.",
                }),
        }),

        handler: async (req, res) => {
            try {
                const { clinicName, contactPerson, email, phone, plan } = req.body;

                // Fetch admin user by role_id
                const adminUser = await User.findOne({
                    where: { role_id: process.env.ADMIN_ROLE_ID },
                });

                if (!adminUser) {
                    return res.status(404).json({ message: "Admin user not found." });
                }

                // Compose email content
                const subject = "New Billing Registration Request";
                const html = `
                <h3>New Clinic Billing Registration Details</h3>
                <p><strong>Clinic Name:</strong> ${clinicName}</p>
                <p><strong>Contact Person:</strong> ${contactPerson}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Selected Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</p>
            `;

                // Send email to admin
                await sendEmail({
                    to: adminUser.email,
                    subject,
                    html,
                    from: '"ClinicLyf" <no-reply@clinicallyf.com>', // Update in production
                });

                return res.status(200).json({
                    success: true,
                    message: "Billing registration submitted successfully. Admin notified by email.",
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

};

module.exports = clinicController;


