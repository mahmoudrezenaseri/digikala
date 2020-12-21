const Warranty = require("src/models/warranty");
const { warrantyValidator } = require('src/graphql/validators/index.js');

const resolvers = {
    Query: {
        getAllWarranty: async (param, args, { req, res }) => {

            const { warranty } = await getAllWarrantyHandler(args)
                .catch((error) => {
                    handleErrors(error, error.code, error.message)
                })

            return warranty.docs;
        }
    },
    Mutation: {
        createWarranty: async (param, args, { req, res }) => {

            // check if user has logged in and is administrator
            if (!await common.checkIfAdmin(req, config.secretId)) {
                handleErrors(null, 403, "امکان استفاده از این بخش وجود ندارد");
                return;
            }

            const { warranty } = await createWarrantyHandler(args)
                .catch((error) => {
                    handleErrors(error, error.code, error.message)
                });

            return {
                status: 200,
                message: "اطلاعات با موفقیت ثبت شد",
                data: warranty
            };
        }
    }
}

async function getAllWarrantyHandler(args) {

    const page = args.input.page || 1;
    const limit = args.input.limit || 10;
    const warranty = await Warranty.paginate({}, { page, limit })

    return new Promise((resolve, reject) => {
        resolve({ warranty });
    });
}

async function createWarrantyHandler(args) {

    // validate user data
    await warrantyValidator.create.validateAsync(args, { abortEarly: false })

    if (await Warranty.findOne({ name: args.name })) {
        throw Error(" گارانتی وارد شده در سیستم موجود است.")
    }

    let warranty = await Warranty.create(args)

    return new Promise((resolve, reject) => {
        resolve({ warranty })
    })
}
module.exports = resolvers;
