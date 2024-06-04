const { default: slugify } = require("slugify");
const Category = require("../models/categoryModel");

const handleCreateCategoryService = async (name) => {
    try {
        const newCategory = await Category.create({
            name: name,
            slug: slugify(name),
        });
        return newCategory;
    } catch (error) {
        throw error;
    }
};

const handleGetCategoriesService = async () => {
    return await Category.find({}).select('name slug').
    lean();
};

const handleGetCategoryService = async (slug) => {
    return await Category.find({slug}).select('name slug').
    lean();
};


const handleUpdateCategoryService = async (slug, name) => {
    try {
        const filter = { slug };
        const updates = {$set: {name: name, slug: slugify(name)}};
        const options = {
            new: true,
        };
        const updateCategory = await Category.findOneAndUpdate(
            filter,
            updates,
            options
        );
        return updateCategory;
    } catch (error) {
        throw error;
    }
};

module.exports = {handleCreateCategoryService, handleGetCategoriesService, handleGetCategoryService, handleUpdateCategoryService};