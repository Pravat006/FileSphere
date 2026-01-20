import { FileType } from "@repo/db";

const getFileType = (mimetype: string): FileType => {
    const type = mimetype.split('/')[0].toLowerCase();

    switch (type) {
        case 'image':
            return FileType.IMAGE;
        case 'video':
            return FileType.VIDEO;
        case 'audio':
            return FileType.AUDIO;
        case 'application':
            // Handle specific application types
            if (mimetype.includes('pdf')) return FileType.DOCUMENT;
            if (mimetype.includes('zip') || mimetype.includes('rar')) return FileType.ARCHIVE;
            if (mimetype.includes('msword') || mimetype.includes('excel') || mimetype.includes('powerpoint')) return FileType.DOCUMENT;
            return FileType.DOCUMENT;
        case 'text':
            return FileType.DOCUMENT;
        default:
            return FileType.OTHER;
    }
};

export default getFileType;