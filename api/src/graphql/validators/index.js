const userValidator = require('./user');
const categoryValidator = require('./category');
const brandValidator = require('./brand');
const surveyValidator = require('./survey');
const productSpecsValidator = require('./productSpecs');
const productSpecDetailsValidator = require('./productSpecDetails');
const sellerValidator = require('./seller');
const warrantyValidator = require('./warranty');
const sliderValidator = require('./slider');
const bannerValidator = require('./banner');
const productValidator = require('./product');
const productAttributeValidator = require('./productAttribute');
const productSpecDetailValueValidator = require('./productSpecDetailValue');
const provinceValidator = require('./province');
const cityValidator = require('./city');

module.exports = {
    userValidator,
    categoryValidator,
    brandValidator,
    surveyValidator,
    productSpecsValidator,
    productSpecDetailsValidator,
    sellerValidator,
    warrantyValidator,
    sliderValidator,
    bannerValidator,
    productValidator,
    productAttributeValidator,
    productSpecDetailValueValidator,
    provinceValidator,
    cityValidator
}