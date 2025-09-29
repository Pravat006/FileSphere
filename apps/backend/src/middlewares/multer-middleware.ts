import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./public/`);
    },
    filename: (req, file, cb) => {
        let fileExtension = ""
        if (file.originalname.split('.').length > 1) {
            fileExtension = file.originalname.substring(
                file.originalname.lastIndexOf('.'),
            )
        }
        const fileNameWithoutExtention = file.originalname.toLowerCase().split(' ').join('-')?.split('.')[0];
        cb(
            null,
            fileNameWithoutExtention + Date.now() + Math.ceil(Math.random() * 1e5) + fileExtension
        )
    }
})

const upload = multer({
    storage,
});

export default upload;

