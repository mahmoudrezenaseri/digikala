const ProductSpecDetails = require("src/models/productSpecDetails");
const Category = require("src/models/category");
const ProductSpecs = require("src/models/productSpecs");

const { productSpecDetailsValidator } = require('src/graphql/validators/index.js');

const resolvers = {
    Query: {
        getPSpecDetailsByPSpec: async (param, args, { req, res }) => {

            // check if user has logged in and is administrator          
            funcs.common.checkIfAdmin(req, config.secretId, { path: "/productSpecDetails/getPSpecDetailsByPSpec" });

            const { specDetails } = await getByProductSpecsHandler(args)
                .catch((error) => {
                    funcs.error.errorHandler(error, error.code, error.message, { path: "/productSpecDetails/getPSpecDetailsByPSpec" })
                });

            return specDetails;
        }
    },
    Mutation: {
        createProductSpecDetails: async (param, args, { req, res }) => {

            // check if user has logged in and is administrator          
            funcs.common.checkIfAdmin(req, config.secretId, { path: "/productSpecDetails/createProductSpecDetails" });

            const { pSpecDetails } = await createProductSpecDetailsHandler(args)
                .catch((error) => {
                    funcs.error.errorHandler(error, error.code, error.message, { path: "/productSpecDetails/createProductSpecDetails" })
                });

            return {
                status: 200,
                message: "اطلاعات با موفقیت ثبت شد",
                data: pSpecDetails
            };
        }
    }
}

async function getByProductSpecsHandler(args) {

    // validate user data
    await productSpecDetailsValidator.getBySpec.validateAsync(args.input, { abortEarly: false })

    specDetails = await ProductSpecDetails.find({ specs: args.specs }).populate("specs").exec();

    return new Promise((resolve, reject) => {
        resolve({ specDetails })
    });
}

async function createProductSpecDetailsHandler(args) {

    // validate user data
    await productSpecDetailsValidator.create.validateAsync(args.input, { abortEarly: false })

    if (!await ProductSpecs.findOne({ _id: args.input.specs })) {
        throw Error("مشخصات وارد شده ثبت نشده است")
    }

    if (await ProductSpecDetails.findOne({ _id: args.input.specs } && { name: args.input.name })) {
        throw Error("نام با مشخصات وارد شده قبلا ثبت شده است")
    }

    let pSpecDetails = await ProductSpecDetails.create(args.input);

    return new Promise((resolve, reject) => {
        resolve({ pSpecDetails })
    });
}

module.exports = resolvers;
