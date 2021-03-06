const User = require("src/models/users");
const bcrypt = require("bcryptjs");
const { userValidator } = require('src/graphql/validators/index.js');

const resolvers = {
    Query: {
        login: async (param, args) => {
            const { user, token } = await loginHandler(args)
                .catch((errors) => {
                    funcs.error.errorHandler(errors, errors.code, errors.message, { path: "/user/login" })
                });

            return {
                user: user,
                token: token,
                refreshToken: ""
            }
        },
        getAllUserWithPagination: async (param, args, { req, res }) => {

            // check if user has logged in and is administrator          
            funcs.common.checkIfAdmin(req, config.secretId, { path: "/user/getAllUserWithPagination" });

            const { user } = await getAllUserWithPaginationHandler(args)
                .catch((error) => {
                    funcs.error.errorHandler(error, error.code, error.message, { path: "/user/getAllUserWithPagination" })
                });

            return {
                totalDocs: user.totalDocs,
                hasNextPage: user.hasNextPage,
                page: user.page,
                users: user.docs,
            };
        },
        filterUser: async (param, args, { req, res }) => {

            // check if user has logged in and is administrator          
            funcs.common.checkIfAdmin(req, config.secretId, { path: "/user/filterUser" });

            const { user } = await filterUserHandler(args)
                .catch((error) => {
                    funcs.error.errorHandler(error, error.code, error.message, { path: "/user/filterUser" })
                });

            return {
                totalDocs: user.totalDocs,
                hasNextPage: user.hasNextPage,
                page: user.page,
                users: user.docs,
            };
        }
    },
    Mutation: {
        register: async (param, args) => {
            const { user, token } = await registerHandler(args.input)
                .catch((errors) => {
                    funcs.error.errorHandler(errors, errors.code, errors.message, { path: "/user/register" })
                })

            return {
                user: user,
                token: token,
                refreshToken: ""
            };
        }
    }
}

// queries
async function loginHandler(args) {

    // validate user data
    await userValidator.login.validateAsync(args, { abortEarly: false })

    // check if the user is already in the database width the same mobile number
    const user = await User.findOne({ mobile: args.mobile });
    if (!user) {
        throw new Error("کاربری با این شماره در سیستم موجود نیست.");
    }

    // check if password is correct
    const isValid = await bcrypt.compareSync(args.password, user.password);
    if (!isValid) {
        throw new Error("کلمه عبور وارد شده اشتباه است");
    }

    // create token
    const token = await User.CreateToken(user.id, config.secretId, '150h');

    return new Promise((resolve, reject) => {
        resolve({ user, token });
    });
}

const getAllUserWithPaginationHandler = async (args) => {
    const page = args.input.page || 1;
    const limit = args.input.limit || 10;
    const user = (args.input.searchText != "") ?
        await User.paginate({ "name": { "$regex": args.input.searchText } }, { page, limit }) :
        await User.paginate({}, { page, limit });

    return new Promise((resolve, reject) => {
        resolve({ user })
    })
}

const filterUserHandler = async (args) => {

    const page = args.input.page || 1;
    const limit = args.input.limit || 10;

    const dateCond = prepareDateCondition(args.input.dateFrom, args.input.dateTo)
    const firstNameCond = prepareFirstNameCondition(args.input.firstName)
    const lastNameCond = prepareLastNameCondition(args.input.lastName)
    const mobileCond = prepareMobileCondition(args.input.mobile)

    const user = await User.paginate({
        $and: [
            firstNameCond,
            lastNameCond,
            mobileCond,
            dateCond
        ]
    }, { page, limit })

    return new Promise((resolve, reject) => {
        resolve({ user })
    })
}

// mutations
async function registerHandler(args) {

    // validate user data
    await userValidator.register.validateAsync(args, { abortEarly: false })

    // check if the user is already in the database width the same mobile number
    const userExist = await User.findOne({ mobile: args.mobile });
    if (userExist) {
        throw new Error("کاربری با این شماره در سیستم موجود است.");
    }

    const salt = bcrypt.genSaltSync(15);
    args.password = bcrypt.hashSync(args.password, salt);

    let user = await User.create(args);
    let token = await User.CreateToken(user.id, config.secretId, '24h');

    return new Promise((resolve, reject) => {
        resolve({ user, token })
    })
}

function prepareFirstNameCondition(name) {
    let cond;
    if (name) {
        cond = {
            "firstName": { "$regex": name.trim() }
        }
    } else {
        cond = {}
    }

    return cond
}

function prepareLastNameCondition(name) {
    let cond;
    if (name) {
        cond = {
            "lastName": { "$regex": name.trim() }
        }
    } else {
        cond = {}
    }

    return cond
}

function prepareMobileCondition(mobile) {
    let cond;
    if (mobile) {
        cond = { "mobile": { "$regex": mobile.trim() } }
    } else {
        cond = {}
    }

    return cond
}

function prepareDateCondition(dateFrom, dateTo) {
    let cond;
    if (dateFrom && dateTo) {
        cond = {
            $and: [
                { "createdAt": { $gte: dateFrom, $lt: dateTo } }
            ]
        }
    } else if (dateFrom && !dateTo) {
        cond = {
            $and: [
                { "createdAt": { $gte: dateFrom } }
            ]
        }
    } else if (!dateFrom && dateTo) {
        cond = {
            $and: [
                { "createdAt": { $lt: dateTo } }
            ]
        }
    } else {
        cond = {}
    }

    return cond
}


module.exports = resolvers;
