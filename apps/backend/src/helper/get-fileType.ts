const getFileType = (mimetype: string): string => {
    const type = mimetype.split('/')[0].toLowerCase();

    switch (type) {
        case 'image':
            return 'IMAGE';
        case 'video':
            return 'VIDEO';
        case 'audio':
            return 'AUDIO';
        case 'application':
            // Handle specific application types
            if (mimetype.includes('pdf')) return 'DOCUMENT';
            if (mimetype.includes('zip') || mimetype.includes('rar')) return 'ARCHIVE';
            if (mimetype.includes('msword') || mimetype.includes('excel') || mimetype.includes('powerpoint')) return 'DOCUMENT';
            return 'DOCUMENT';
        case 'text':
            return 'DOCUMENT';
        default:
            return 'OTHER';
    }
};

export default getFileType