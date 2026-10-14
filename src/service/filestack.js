// Filestack (https://www.filestack.com) uploads, loaded on demand so the picker isn't in the main bundle.
// Demo key — set VITE_FILESTACK_API_KEY to use your own Filestack account. Files uploaded with the
// shared demo key land in Filestack's demo account, so don't use it for real user data.
const DEMO_API_KEY = 'APQLlwqrRScGxhw78gs9Wz';

export const FILESTACK_API_KEY = import.meta.env.VITE_FILESTACK_API_KEY || DEMO_API_KEY;
export const isDemoFilestackKey = FILESTACK_API_KEY === DEMO_API_KEY;

const CDN_URL = 'https://cdn.filestackcontent.com';
const AVATAR_MAX_SIZE = 10 * 1024 * 1024;

let clientPromise = null;

function getClient() {
    clientPromise ??= import('filestack-js')
        .then((filestack) => filestack.init(FILESTACK_API_KEY))
        .catch((error) => {
            clientPromise = null; // let the next call retry, e.g. after a failed chunk download
            throw error;
        });

    return clientPromise;
}

/** CDN URL for a square, face-centred avatar. Transforms run left to right: resize first, then output. */
export function avatarUrl(handle, size = 256) {
    return `${CDN_URL}/resize=width:${size},height:${size},fit:crop,align:faces/output=format:webp/${handle}`;
}

/**
 * Opens the picker for one image, forced to a square crop. Calls `onUpload(file)` with the uploaded
 * file's metadata (`handle`, `url`, `mimetype`, …), or closes the picker and calls `onError()` if the upload fails.
 */
export async function openAvatarPicker({ onUpload, onError }) {
    const client = await getClient();

    const picker = client.picker({
        accept: ['image/*'],
        maxFiles: 1,
        maxSize: AVATAR_MAX_SIZE,
        fromSources: ['local_file_system', 'webcam', 'url'],
        disableDirectoryUpload: true,
        transformations: { crop: { aspectRatio: 1, force: true }, circle: false, rotate: true },
        // Defaults retry 10 times with backoff, so a rejected upload (e.g. 429 for a blocked key) would spin for minutes.
        uploadConfig: { retry: 2, timeout: 30000 },
        onUploadDone: ({ filesUploaded }) => {
            if (filesUploaded[0]) onUpload(filesUploaded[0]);
        },
        // The picker keeps showing the failed file, so close it and let the page report the error.
        onFileUploadFailed: () => {
            picker.close();
            onError();
        }
    });

    return picker.open();
}
