const FileManager = require("src/models/filemanager");

const path = require('path');
const ImageSize = require('image-size');
const FileType = require('file-type');

const rootTopoublicFolder = '/../../../public/';

var resolvers = {
    Query: {
        getAllFiles: async (param, args, { req }) => {

            // check if user has logged in and is administrator
            if (!await common.checkIfAdmin(req, config.secretId)) {
                handleErrors(null, 403, "امکان استفاده از این بخش وجود ندارد");
                return;
            }

            const { media } = await getAllFilesHandler(args)
                .catch((error) => {
                    handleErrors(error, error.code, error.message)
                });

            return {
                totalDocs: media.totalDocs,
                hasNextPage: media.hasNextPage,
                page: media.page,
                files: media.docs,
            };
        }
    },
    Mutation: {
        createFile: async (param, args, { req, res }) => {

            if (!await common.checkIfAdmin(req, config.secretId)) {
                handleErrors(null, 403, "امکان استفاده از این بخش وجود ندارد");
                return;
            }

            const { file } = await fileUploadHandler(args)
                .catch((error) => {
                    handleErrors(error, error.code, error.message)
                });

            return {
                status: 200,
                message: "اطلاعات با موفقیت ثبت شد",
                data: file
            };
        }
    },
};

const fileUploadHandler = async (args) => {

    const { createReadStream, filename } = await args.image;
    const stream = createReadStream();
    const { filePath } = await common.saveImage({ stream, filename });

    let file = await FileManager.create({
        name: filename,
        dir: filePath
    });

    return new Promise((resolve, reject) => {
        resolve({ file })
    })
}

// queries
const getAllFilesHandler = async (args) => {

    const page = args.page || 1;
    const limit = args.limit || 10;

    const media = (args.searchText == null) ? await FileManager.paginate({}, { page, limit }) :
        await FileManager.paginate({ "name": { "$regex": args.searchText } }, { page, limit });

    await prepareFiles(media);

    return new Promise((resolve, reject) => {
        resolve({ media })
    });
}

// prepare extra info for server in response
async function prepareFiles(media) {
    for (let index = 0; index < media.docs.length; index++) {
        const element = media.docs[index];
        ImageSize(path.join(__dirname, `${rootTopoublicFolder}${element.dir}`), async (err, dim) => {
            element.dimWidth = await dim.width;
            element.dimheight = await dim.height;
        });

        const type = await FileType.fromFile(path.join(__dirname, `${rootTopoublicFolder}${element.dir}`));
        element.format = type.ext;
    }
}

module.exports = resolvers;

