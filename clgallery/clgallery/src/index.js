addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const objectId = url.searchParams.get('objectId');

    if (!objectId) {
        return new Response('objectId is required', {
            status: 400
        });
    }

    const apiUrl = 'https://fullnode.testnet.sui.io:443/';
    const aggregatorUrl = 'https://aggregator-devnet.walrus.space'
    const payload = {
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getObject",
        params: [
            objectId,
            {                
                showContent: true,
                
            }
        ]
    };

    const init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    };

    try {
        const response = await fetch(apiUrl, init);
        const results = await response.json();
        
        console.log('API response:', JSON.stringify(results));

        if (results.result && results.result.data && results.result.data.content && results.result.data.content.fields) {
            const blobId = results.result.data.content.fields.image_blob;
            const blobUrl = `${aggregatorUrl}/v1/${blobId}`;

            console.log('Blob URL:', blobUrl);

			const convertToBase64 = async (url) => {
                const imageResponse = await fetch(url);
                const imageBuffer = await imageResponse.arrayBuffer();
                const imageBase64 = btoa(
                    new Uint8Array(imageBuffer)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                return `data:image/jpeg;base64,${imageBase64}`;
            };

			const image = await convertToBase64(blobUrl);
            // Create SVG with embedded image
            const svg = `
            <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#ffffff0d" stroke-width="1" rx="32" ry="32"/>
                <image href="${image}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"/>
            </svg>`;

            return new Response(svg, {
                status: 200,
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=600'
                }
            });
        } else {
            console.log('Invalid response structure:', JSON.stringify(results));
            return new Response('Invalid response structure', {
                status: 500
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
        return new Response(error.message, {
            status: 500
        });
    }
}

