let code = ''
let urlMatcher = /\code\?cached$/

addEventListener(
  'message',
  (message: MessageEvent<[action: 'cache', code: string]>) => {
    const [action] = message.data

    if (action === 'cache') {
      const [_, newCode] = message.data

      code = newCode
    }
  }
)

addEventListener('fetch', (event: Event) => { 
  const fetch = event as FetchEvent

  if (fetch.request.url.match(urlMatcher)) {
    fetch.respondWith(
      new Response(code, {
        status: 200,
        statusText: '200 OK',
        headers: {
          'Content-Type': 'application/javascript'
        },
      })
    )
  }
})