# Node.js 18 fetch and combined `set-cookie` header

When fetching an endpoint which sets multiple cookies, the response has only a single combined `set-cookie` header.

Example:

1. add 2 cookies in endpoint

```
"set-cookie": [
  "user=alice; Path=/; Expires=Thu, 01 Jun 2023 10:00:00 GMT; HttpOnly",
  "role=guest; Path=/"
]
```

2. fetch endpoint. response only has a single `set-cookie` header with values joined by `,`

```
set-cookie: user=alice; Path=/; Expires=Thu, 01 Jun 2023 10:00:00 GMT; HttpOnly, role=guest; Path=/
```

3. a simple split by `,` is not enought as the cookie could contain additional `,` characters (eg. in the `expires` value)

```
0: user=alice; Path=/; Expires=Thu
1: 01 Jun 2023 10:00:00 GMT; HttpOnly
2: role=guest; Path=/
```

# set-cookie-parser

The library **set-cookie-parser** has a [`splitCookiesString(combinedSetCookieHeader)`](https://github.com/nfriedly/set-cookie-parser/blob/3eab8b7d5d12c8ed87832532861c1a35520cf5b3/lib/set-cookie.js#L133) function

# references

- https://github.com/whatwg/fetch/issues/973
- Wrong header split set-cookie https://github.com/node-fetch/node-fetch/issues/349
- How to get an array of header values now that getAll has been removed? https://github.com/node-fetch/node-fetch/issues/251
- https://stackoverflow.com/questions/63204093/how-to-get-set-multiple-set-cookie-headers-using-fetch-api
- https://nodejs.org/dist/latest-v18.x/docs/api/http.html#responsesetheadername-value
