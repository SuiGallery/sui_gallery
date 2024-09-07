import { useState } from 'react';

export interface UploadedBlobInfo {
    blobId: string;
    endEpoch: number;
    suiRef: string;
    status: string;
}

export function useImageUploader() {
    const [epochs, setEpochs] = useState('1');
    const [uploading, setUploading] = useState(false);
    const [uploadedBlobs, setUploadedBlobs] = useState<UploadedBlobInfo[]>([]);
    const [publisherUrl, setPublisherUrl] = useState('https://publisher-devnet.walrus.space');
    const [aggregatorUrl, setAggregatorUrl] = useState('https://aggregator-devnet.walrus.space');

    const storeBlob = async (fileOrUrl: File | string) => {
        setUploading(true);
        try {
            let body: File | Blob;
            if (typeof fileOrUrl === 'string') {
                // If it's a URL, fetch the image and create a Blob
                const response = await fetch(fileOrUrl);
                const blob = await response.blob();
                body = blob;
            } else {
                body = fileOrUrl;
            }

            const response = await fetch(`${publisherUrl}/v1/store?epochs=${epochs}`, {
                method: 'PUT',
                body: body,
            });

            if (response.status === 200) {
                const info = await response.json();
                console.log(info);

                let blobInfo: UploadedBlobInfo;
                if ('alreadyCertified' in info) {
                    blobInfo = {
                        status: 'Already certified',
                        blobId: info.alreadyCertified.blobId,
                        endEpoch: info.alreadyCertified.endEpoch,
                        suiRef: info.alreadyCertified.event.txDigest,
                    };
                } else if ('newlyCreated' in info) {
                    blobInfo = {
                        status: 'Newly created',
                        blobId: info.newlyCreated.blobObject.blobId,
                        endEpoch: info.newlyCreated.blobObject.storage.endEpoch,
                        suiRef: info.newlyCreated.blobObject.id,
                    };
                } else {
                    throw new Error('Unexpected response format');
                }

                setUploadedBlobs(prev => [blobInfo, ...prev]);
                return blobInfo;
            } else {
                throw new Error('Something went wrong when storing the blob!');
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    return {
        epochs,
        setEpochs,
        uploading,
        uploadedBlobs,
        publisherUrl,
        setPublisherUrl,
        aggregatorUrl,
        setAggregatorUrl,
        storeBlob
    };
}