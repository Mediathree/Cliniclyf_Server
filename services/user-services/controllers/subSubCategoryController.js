const Joi = require("joi");

const SubSubCategory = require("../../../models/SubSubCategory");

const subSubCategoryController = {
    createSubSubCategory: {
        validation: Joi.object({
            name: Joi.string().required(),
            subCategoryId: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const { name, subCategoryId } = req.body;

                const subSubCategoryExists = await SubSubCategory.findOne({ where: { name, subCategoryId } });
                if (subSubCategoryExists) return res.status(400).json({ success: false, message: "subSubCategory already exists", data: null });

                const subSubCategory = await SubSubCategory.create({ name, subCategoryId });

                return res.status(201).json({ success: true, message: "subSubCategory created successfully", subSubCategory });
            } catch (error) {
                console.error(error.message);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },
    getSubSubCategory: {
        handler: async (req, res) => {
            try {

                const subSubCategories = await SubSubCategory.findAll({});

                return res.status(200).json({ success: true, message: "subSubCategories fetched successfully", subSubCategories });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },
};

module.exports = subSubCategoryController;