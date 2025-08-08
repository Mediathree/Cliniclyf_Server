const Joi = require("joi");
const Product = require("../../../models/product");
const Photo = require("../../../models/photo");
const Rating = require("../../../models/rating");
const User = require("../../../models/user");
const Category = require("../../../models/Category");
const SubCategory = require("../../../models/SubCategory");
const SubSubCategory = require("../../../models/SubSubCategory");
const { Op } = require("sequelize");

const productController = {
    createProduct: {
        validation: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            photo: Joi.any().optional(),
            status: Joi.string().required(),
            categoryId: Joi.string().required(),
            subCategoryId: Joi.string().optional(),
            subSubCategoryId: Joi.string().optional(),
            price: Joi.number().required(),
            discountType: Joi.string().required(),
            discountPercentage: Joi.string().required(),
            freeDelivery: Joi.boolean().required(),
        }),

        handler: async (req, res) => {
            try {
                const { name, description, status, categoryId, subCategoryId, subSubCategoryId, price, discountType, discountPercentage, freeDelivery } = req.body;

                const product = await Product.create({ name, description, status, categoryId, subCategoryId, subSubCategoryId, price: Number(price), discountType, discountPercentage, freeDelivery });

                if (product && req.file) {
                    await Photo.create({ photoable_id: product.id, url: req.file.path, name: req.file.originalname })
                }

                res.status(201).json({ success: true, message: "Product created successfully", data: null, error: null });
            } catch (error) {
                console.error(error.message);
                res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    getProductById: {
        handler: async (req, res) => {
            try {
                const { id } = req.params;

                const product = await Product.findOne({
                    where: { id },
                    include: [
                        {
                            model: Rating,
                            attributes: ['rating', 'review'],
                            include: [
                                {
                                    model: User,
                                    as: "givenBy",
                                    attributes: ['name', 'email'],
                                    include: [
                                        {
                                            model: Photo,
                                            attributes: ['id', 'url']
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: Photo,
                            attributes: ['id', 'url']
                        },
                        {
                            model: Category,
                            attributes: ['id', 'name']
                        },
                        {
                            model: SubCategory,
                            attributes: ['id', 'name']
                        },
                        {
                            model: SubSubCategory,
                            attributes: ['id', 'name']
                        }
                    ]
                });

                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: "Product not found",
                        data: null,
                        error: "Product with given ID does not exist"
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Product fetched successfully",
                    data: product,
                    error: null
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                    data: null,
                    error: "Server error"
                });
            }
        }
    },

    getProducts: {
        handler: async (req, res) => {
            try {
                const { name, categoryId, subCategoryId, subSubCategoryId } = req.query;

                const whereClause = {};
                if (name) {
                    whereClause.name = {
                        [Op.iLike]: `%${name}%` // case-insensitive partial match
                    };
                }
                if (categoryId) whereClause.categoryId = categoryId;
                if (subCategoryId) whereClause.subCategoryId = subCategoryId;
                if (subSubCategoryId) whereClause.subSubCategoryId = subSubCategoryId;

                const products = await Product.findAll({
                    where: whereClause,
                    include: [
                        {
                            model: Photo,
                            attributes: ['id', 'url']
                        },
                        {
                            model: Category,
                            attributes: ['id', 'name']
                        },
                        {
                            model: SubCategory,
                            attributes: ['id', 'name']
                        },
                        {
                            model: SubSubCategory,
                            attributes: ['id', 'name']
                        }
                    ]
                });

                res.status(200).json({
                    success: true,
                    message: "Products fetched successfully",
                    data: products,
                    error: null
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                    data: null,
                    error: "Server error"
                });
            }
        }
    },

    updateProduct: {
        validation: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            photo: Joi.any().optional(),
            status: Joi.string().required(),
            categoryId: Joi.string().required(),
            subCategoryId: Joi.string().optional(),
            subSubCategoryId: Joi.string().optional(),
            price: Joi.number().required(),
            discountType: Joi.string().required(),
            discountPercentage: Joi.string().required(),
            freeDelivery: Joi.boolean().required(),
        }),

        handler: async (req, res) => {
            try {
                const { id } = req.params;
                let { name, description, status, categoryId, subCategoryId, subSubCategoryId, price, discountType, discountPercentage, freeDelivery } = req.body;

                await Product.update({ name, description, status, categoryId, subCategoryId, subSubCategoryId, price: Number(price), discountType, discountPercentage, freeDelivery }, { where: { id } });


                if (req.file) {
                    await Photo.update({ url: req.file.path, name: req.file.originalname }, {
                        where: {
                            photoable_id: id
                        }
                    })
                }

                res.status(201).json({ success: true, message: "Product updated successfully", data: null, error: null });
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    deleteProduct: {

        handler: async (req, res) => {
            try {
                const { id } = req.params;

                await Product.destroy({
                    where: {
                        id
                    }
                })

                res.status(201).json({ success: true, message: "Product deleted successfully", data: null, error: null });
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },
};

module.exports = productController;


