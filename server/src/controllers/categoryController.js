const { successResponse } = require("./responseController");
const slugify = require('slugify');
const Category = require('../models/categoryModel');
const {handleCreateCategoryService, handleGetCategoriesService, handleGetCategoryService, handleUpdateCategoryService} = require("../services/categoryService");
const createHttpError = require("http-errors");

const handleCreateCategory = async (req, res, next) => {
    try {
      const { name } = req.body;
      
      const newCategory = handleCreateCategoryService (name);

      return successResponse(res, {
        statusCode: 201,
        message: 'category was created successfully',
        payload: newCategory,
      });

    } 
    catch (error) { 
      next(error);
    }
};

const handleGetCategories = async (req, res, next) => {
    try {
      const categories = await handleGetCategoriesService();  
      return successResponse(res, {
        statusCode: 200,
        message: 'categories fetched successfully',
        payload: categories,
      });

    } 
    catch (error) { 
      next(error);
    }
};

const handleGetCategory = async (req, res, next) => {
    try {
      const {slug} = req.params;
      const category = await handleGetCategoryService(slug);  

      return successResponse(res, {
        statusCode: 200,
        message: 'category fetched successfully',
        payload: category,
      });

    } 
    catch (error) { 
      next(error);
    }
};

const handleUpdateCategory = async (req, res, next) => {
    try {
      const { slug } = req.params;
      const { name } = req.body;
      
      const updateCategory = await handleUpdateCategoryService (slug, name);

      console.log(updateCategory);
      
      if(!updateCategory){
        throw createHttpError(404, 'No category found with this slag');
      }

      return successResponse(res, {
        statusCode: 200,
        message: 'category was updated successfully',
        payload: {updateCategory},
      });

    } 
    catch (error) { 
      next(error);
    }
};

module.exports = {handleCreateCategory, handleGetCategories, handleGetCategory, handleUpdateCategory};