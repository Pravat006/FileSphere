interface Folder {
    id: string;
    name: string;
    ownerId: string; // user id

}

interface CreateFolderRequest {
    name: string;
}
interface UpdateFolderRequest {
    name?: string;
}

interface DeleteFolderRequest {
    id: string;
}

export { Folder, CreateFolderRequest, UpdateFolderRequest, DeleteFolderRequest };

