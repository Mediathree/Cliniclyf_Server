const Joi = require("joi");

const Category = require("../../../models/category");

const categoryController = {
    createCategory: {
        validation: Joi.object({
            name: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const { name } = req.body;

                const categoryExists = await Category.findOne({ where: { name } });
                if (categoryExists) return res.status(400).json({ success: false, message: "Category already exists", data: null });

                const category = await Category.create({ name });

                return res.status(201).json({ success: true, message: "Category created successfully", category });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },
    getCategory: {
        handler: async (req, res) => {
            try {

                const categories = await Category.findAll({});

                return res.status(200).json({ success: true, message: "Categories fetched successfully", categories });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },
};

module.exports = categoryController;