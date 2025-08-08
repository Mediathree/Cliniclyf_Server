const Joi = require("joi");

const SubCategory = require("../../../models/subCategory");

const subCategoryController = {
    createSubCategory: {
        validation: Joi.object({
            name: Joi.string().required(),
            categoryId: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const { name, categoryId } = req.body;

                const subCategoryExists = await SubCategory.findOne({ where: { name, categoryId } });
                if (subCategoryExists) return res.status(400).json({ success: false, message: "subCategory already exists", data: null });

                const subCategory = await SubCategory.create({ name, categoryId });

                return res.status(201).json({ success: true, message: "subCategory created successfully", subCategory });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },
    getSubCategory: {
        handler: async (req, res) => {
            try {

                const subCategories = await SubCategory.findAll({});

                return res.status(200).json({ success: true, message: "subCategories fetched successfully", subCategories });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },
};

module.exports = subCategoryController;