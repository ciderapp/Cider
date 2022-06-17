const CiderKit = {
    v1: {
        musickit: {
            async mkv3(route, body, options) {
                let opts = {
                    method: 'POST',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: {}
                }
                opts.body = JSON.stringify({
                    route: route,
                    body: body,
                    options: options
                })
                let response = await fetch("./api/musickit/v3", opts);
                return response.json()
            }
        }
    }
}