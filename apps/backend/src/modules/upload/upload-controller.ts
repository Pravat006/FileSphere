import { asyncHandler } from "@/utils/async-handler";
import status from "http-status";
import { ApiError, ApiResponse } from "@/interface";
import {
    abortUpload,
    complete,
    initiateUpload,

} from "./upload-service";



export const initiateUploadController = asyncHandler(async (req, res) => {

    const userId = req.user?.id

    if (!userId) {
        throw new ApiError(status.UNAUTHORIZED, "Unauthorized action")
    }

    const { filename, size, mimeType } = req.body;
    // folder is optional , if not provided then null 
    const { folderId } = req.params;
    //    create actual file record in db

    const upload = await initiateUpload({ filename, size, mimeType, ownerId: userId, folderId });

    return res.status(status.OK).json(upload)

}
)


/**
 * complete multipart upload
 */

export const completeMultiPartUpload = asyncHandler(async (req, res) => {
    const { fileId, parts } = req.body

    await complete(fileId, parts)

    return res.status(200).json(
        new ApiResponse(status.OK, "file uploaded successfully")
    )

})


export const abortUploadController = asyncHandler(async (req, res) => {
    const { fileId } = req.body;
    await abortUpload(fileId);
    return res.status(status.OK).json(
        new ApiResponse(status.OK, "file upload aborted successfully")
    )
})


