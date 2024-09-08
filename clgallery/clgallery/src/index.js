addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    if (request.method === 'OPTIONS') {
        return handleCORS(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/proxy-image') {
        return handleProxyImage(request);
    }

    return handleExistingRoute(request);
}

function handleCORS(request) {
    let headers = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });

    return new Response(null, {
        status: 204,
        headers
    });
}

async function handleProxyImage(request) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    let imageUrl;
    try {
        const body = await request.json();
        imageUrl = body.url;
    } catch (error) {
        return new Response('Invalid JSON', { status: 400 });
    }

    if (!imageUrl) {
        return new Response('Missing URL in request body', { status: 400 });
    }

    try {
        const response = await fetch(imageUrl);
        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(response.body, {
            status: response.status,
            headers
        });
    } catch (error) {
        return new Response('Failed to proxy image: ' + error.message, { status: 500 });
    }
}

// 你现有的路由处理函数
async function handleExistingRoute(request) {
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

