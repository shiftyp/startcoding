"use strict";
let code = '';
let urlMatcher = /\code\?cached$/;
addEventListener('message', (message) => {
    const [action] = message.data;
    if (action === 'cache') {
        const [_, newCode] = message.data;
        code = newCode;
    }
});
addEventListener('fetch', (event) => {
    const fetch = event;
    if (fetch.request.url.match(urlMatcher)) {
        fetch.respondWith(new Response(code, {
            status: 200,
            statusText: '200 OK',
            headers: {
                'Content-Type': 'application/javascript'
            },
        }));
    }
});
//# sourceMappingURL=service-worker.js.map