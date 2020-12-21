const Slider = require("src/models/slider");
const { sliderValidator } = require('src/graphql/validators');

const resolvers = {
    Query: {
        getAllSlider: async (param, args, { req, res }) => {

            const { slider } = await getAllSliderHandler(args)
                .catch((error) => {
                    handleErrors(error, error.code, error.message)
                })

            return slider.docs;
        }
    },
    Mutation: {
        createSlider: async (param, args, { req, res }) => {

            // check if user has logged in and is administrator
            if (!await common.checkIfAdmin(req, config.secretId)) {
                handleErrors(null, 403, "امکان استفاده از این بخش وجود ندارد");
                return;
            }

            const { slider } = await createSliderHandler(args)
                .catch((error) => {
                    handleErrors(error, error.code, error.message)
                });

            return {
                status: 200,
                message: "اطلاعات با موفقیت ثبت شد",
                data: slider
            };
        }
    }
}

async function getAllSliderHandler(args) {

    const page = args.page || 1;
    const limit = args.limit || 10;
    const slider = await Slider.paginate({}, { page, limit })

    return new Promise((resolve, reject) => {
        resolve({ slider });
    });
}

async function createSliderHandler(args) {

    // validate user data
    await sliderValidator.create.validateAsync(args, { abortEarly: false })

    if (await Slider.findOne({ name: args.name })) {
        throw Error(" نام وارد شده در سیستم موجود است.")
    }

    if (args.isDefault) {
        if (await Slider.findOne({ default: args.isDefault })) {
            throw Error("اسلایدر پیش فرض قبلا انتخاب شده است.");
        }
    }

    let slider = await Slider.create(args);

    return new Promise((resolve, reject) => {
        resolve({ slider })
    })
}

module.exports = resolvers;
