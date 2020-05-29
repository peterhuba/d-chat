# d-chat
## Decentralized messaging app based on IPFS and OrbitDB with peer-to-peer web page hosting

React-based chat app POC that demonstrates advantages of a decentralized architecture in a web context. It can serve as a reliable communication platform thanks to the [IPFS](https://ipfs.io)-based [OrbitDB](https://github.com/orbitdb/orbit-db), a distributed, serverless, peer-to-peer database.

By running an IPFS node in the service worker and pulling the web pages' source there, the app itself can be a server and contibute to hosting the website. This, besides offering efficient scaling, improves reliability, since new users can still load the page when the origin server is not available.

<img src="https://user-images.githubusercontent.com/22678054/64920429-55854200-d7c0-11e9-94f7-4efa1ca0b179.png" height="350">

## How does it work?

- Once the user tries to load a page, the browser will be redirected to an IPFS gateway thanks to the `CNAME` DNS record.

- The client browser loads the app from a server running an IPFS implementation, where the built source of the webapp is present. The page gets loaded via any public IPFS gateway, which will get the requested content from the IPFS network and send it back to the client via HTTP.

- The client creates an instance of `js-ipfs` in a service worker, thanks to which it can start taking advantage of the benefits of the peer-to-peer web: any future fetch request of IPFS content-addressed information can be loaded from anywhere where it is present on an IPFS node. It can load parts of the webpage from the devices of other visitors, which can act as a server.

- The service worker then opens OrbitDB distibuted databases and replicates them and the messages found will be displayed.

- Any new sent/received message will appear at the other clients when the DBs are replicated. There is no guarantee of strong consistency, only strong eventual consistency, i.e. once all instances have received all the updates, their state will be the same (no conflicts, divergence).

- Later, the web application's source itself will be loaded into the IPFS node running in the client's service worker, which means that even if the origin server goes unavailable, new clients can still access the page, because the gateways will be able to get and send back the page to the newly joining client from any existing client online. The web application's version to be "pinned" i.e. hosted at the clients' side will be obtained either via IPNS by resolving `/ipns/yourdomain.com` or by the application retrieving the hash from the DNS record of the domain.

<img src="https://user-images.githubusercontent.com/22678054/64920632-9716ec80-d7c2-11e9-83ac-b57653555538.png" width="500">

### Run on local

Install with: `npm install`

Build with: `npm run build-local`

Install any tool for serving statically the built directory e.g. `npm install -g node-static`

Run it using: `static -p <port>` and go to `localhost:<port>/d-chat`

### Deploy

- set up a domain with a provider that supports IPFS (i.e. Cloudflare) a `CNAME` DNS record that will redirect to `couldflare-ipfs.com` 

- run a build with `npm run build`

- run `jsipfs add -r build` to add the app's folder to the local IPFS node's repo

- pin the contents by running `jsipfs pin add <hash>` so that it won't be deleted from the cache

To deploy dynamic content: 

- run `jsipfs name publish <hash>`

- then, add the output hash (which is the node's ID) a to `TXT` DNS record with the name `_dnslink` and value `dnslink=/ipns/<nodeIdHash>`

For static content: 

- add the output hash (which is the node's ID) to TXT DNS record with the name `_dnslink` and value `dnslink=/ipfs/<contentHash>`

For the moment, the latter is recommended since IPNS discovery seems to time out frequently.

## Potential simplified usage of IPFS for webapps

The whole burden of running an IPFS implementation for the app can be avoided if the users happen to have the IPFS browser extentsion installed or when natively IPFS-compatible browsers will be available. https://github.com/brave/brave-browser/issues/819
