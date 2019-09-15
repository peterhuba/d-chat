'use strict'

const IPFS = require('ipfs');
const isIPFS = require('is-ipfs');
const OrbitDB = require('orbit-db');
const Identities = require('orbit-db-identity-provider');
const { createProxyServer } = require('ipfs-postmsg-proxy');
const fileReaderPullStream = require('pull-file-reader');

const defaultThreadName = 'default';

const ipfsRepoName = 'd-chat-webapp-room';
const messagesDbName = 'd-chat-webapp-messages-db';
const usersDbName = 'd-chat-webapp-users-db';

let ipfsNode;
let ipfsId;
let orbitDbInstance;
let messagesDb;
let usersDb;
let dbIdentity;

let broadcastChannel;

const ipfsConfig = {
    EXPERIMENTAL: {
        pubsub: true
    },
    repo: ipfsRepoName,
    config: {
        Addresses: {
            Swarm: [
                '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
            ]
        }
    }
}

const messagesDbConfig = {
    type: 'feed',
    create: true,
    accessController: {
        admin: ['*'],
        write: ['*']
    }
};

const userDbConfig = {
    type: 'keyvalue',
    create: true,
    accessController: {
        admin: ['*'],
        write: ['*']
    }
};

self.addEventListener('install', (event) => {
    console.log('Installing IPFS service worker');
    event.waitUntil(self.skipWaiting());
})

self.addEventListener('activate', (event) => {
    console.log('Activating IPFS service worker');
    initializeWorker();
    event.waitUntil(self.clients.claim());
})

self.addEventListener('fetch', (event) => {
    if (event.request.url.indexOf('/ipfs/') === -1) {
        return console.log('Fetch not in IPFS scope', event.request.url);
    }

    console.log('Handling fetch event for', event.request.url);
    const multihash = event.request.url.substring(event.request.url.lastIndexOf('/ipfs/')).split('/ipfs/')[1];

    initializeWorker();
    event.respondWith(getImageFromIpfsAndCreateResponse(multihash));
})

const initializeWorker = () => {
    initBroadcastChannel();
    initIpfs();

    broadcastChannel.postMessage({ command: 'workerInitialized' });
}

const initIpfs = () => {
    if (ipfsNode) {
        return; // no need to reload variables, worker has not been stopped
    }

    ipfsNode = new IPFS(ipfsConfig);
    ipfsNode.on('ready', loadAppResources);
    ipfsNode.on('error', (err) => console.log('Starting service worker IPFS node failed', err));
};

const initBroadcastChannel = () => {
    if (broadcastChannel) {
        return;
    }

    broadcastChannel = new BroadcastChannel('broadcastChannel');
    broadcastChannel.addEventListener('message', handleIncomingMessage);
}

const loadAppResources = async () => {
    let result = await ipfsNode.id();
    ipfsId = result.id;
    console.log("IPFS service worker node ready with ID", ipfsId);

    await initDecentralizedDatabases();
    pinAndServeApplication();
}

const initDecentralizedDatabases = async () => {
    dbIdentity = await Identities.createIdentity({ id: ipfsId })
    console.log('Identity creation done', dbIdentity);

    orbitDbInstance = await OrbitDB.createInstance(ipfsNode, { identity: dbIdentity });
    console.log('Created OrbitDB instance');

    await openMessagesDb(defaultThreadName);
    addMessagesDbEventHandlers();
    messagesDb.load();

    await openUsersDb();
    addUsersDbEventHandlers();
    usersDb.load();
}

const pinAndServeApplication = () => {
    if (isIPFS.url(self.registration.scope)) {
        pinApplicaitonUsingHash(getHashFromIpfsAddress(self.registration.scope));
    } else {
        let address = '/ipns/peterhuba.me'
        ipfsNode.name.resolve(address, (err, name) => {
            if (err) {
                throw err;
            }
            console.log('IPNS address ' + address + ' resolved to hash ' + name);
            pinApplicaitonUsingHash(getHashFromIpfsAddress(name));
        })

        // console.log('About to get app hash from DNS TXT');
        // fetch('https://cloudflare-dns.com/dns-query?name=_dnslink.yourdomain.com&type=TXT', {
        //     headers: {
        //         'accept': 'application/dns-json'
        //     }
        // })
        //     .then(response => {
        //         return response.text()
        //     })
        //     .then(data => {
        //         let dnsTxtRecord = JSON.parse(data).Answer[0].data;
        //         console.log('DNSLink record:', dnsTxtRecord);
        //         pinApplicaitonUsingHash(getHashFromIpfsAddress(dnsTxtRecord).slice(0, -1));
        //     })
        //     .catch(error => console.log('had an error', error))
    }
}

const getHashFromIpfsAddress = (address) => {
    return address.split('/ipfs/')[1].split('/')[0];
}

const pinApplicaitonUsingHash = (hash) => {
    console.log('About to pin application using hash', hash);
    pinContentToIpfsNode(hash, () => {
        broadcastChannel.postMessage({ command: 'appPinned' });
    });
}

const addMessagesDbEventHandlers = () => {
    messagesDb.events.on('ready', () => {
        console.log('Messages DB ready');
        sendMessagesFromDbToClient();
    });

    messagesDb.events.on('replicated', () => {
        console.log('Messages DB replicated');
        broadcastChannel.postMessage({ command: 'dbSynced' });
        sendMessagesFromDbToClient();
    });

    messagesDb.events.on('write', (dbname, hash, entry) => {
        console.log('Messages DB write');
        sendMessagesFromDbToClient();
    });

    messagesDb.events.on('load.progress', (address, hash, entry, progress, total) => {
        console.log('Messages DB load.progress', progress, total);
    });
}

const addUsersDbEventHandlers = () => {
    usersDb.events.on('ready', () => {
        console.log('Users DB ready');
        sendMessagesFromDbToClient();
    });

    usersDb.events.on('replicated', () => {
        console.log('Users DB replicated');
        sendMessagesFromDbToClient();
    });

    usersDb.events.on('write', (dbname, hash, entry) => {
        console.log('Users DB write');
        sendMessagesFromDbToClient();
    });
}

const getImageFromIpfsAndCreateResponse = async (hash) => {
    console.log('About to get content by hash', hash);
    try {
        const files = await ipfsNode.get(hash);
        const data = files[0].content;
        let imgHeaders = new Headers();
        imgHeaders.append('Content-Type', 'image/jpeg');
        imgHeaders.append('Content-Length', data.length);
        const headers = { status: 200, statusText: 'OK', imgHeaders };
        return new Response(data, headers);
    } catch (err) {
        console.error('Failed to fetch data from service worker IPFS node', err);
    }
}

const sendMessagesFromDbToClient = () => {
    let elements = messagesDb.iterator({ limit: -1 })
        .collect()
        .map((e) => e.payload.value);

    elements.forEach((e) => {
        if (e.senderId === ipfsId) {
            e.isOwn = true;
        }
        e.sender = usersDb.get(e.senderId);
    });

    elements.sort(function (a, b) {
        a = new Date(a.date);
        b = new Date(b.date);
        return a > b ? 1 : a < b ? -1 : 0;
    });

    if (usersDb) {
        let currentlySetName = usersDb.get(ipfsId);
        let nameToSend = currentlySetName ? currentlySetName : ipfsId
        broadcastChannel.postMessage({ command: 'currentlySetName', name: nameToSend });
    }

    broadcastChannel.postMessage({ messages: elements });
}

const handleIncomingMessage = async (event) => {
    let messageContent = event.data;

    if (messageContent.command === 'initialSync') {
        initializeWorker();
        broadcastChannel.postMessage({ command: 'workerInitialized' });
        sendMessagesFromDbToClient();
        return;
    } else if (messageContent.command === 'saveUsername') {
        await handleSaveUsernameCommand(messageContent);
        return;
    } else if (messageContent.command === 'setThread') {
        await handleSetChatThreadCommand(messageContent);
        return;
    }

    if (messageContent.image != null) {
        addImageToDb(messageContent);
        return;
    }

    addMessageToDb(messageContent);
}

const addImageToDb = (messageContent) => {
    const fileStream = fileReaderPullStream(messageContent.image);
    ipfsNode.add(fileStream, { pin: true }, (err, result) => {
        if (err) {
            return console.error('Failed to add image', err);
        }
        
        const hash = result[0].hash;
        console.log('Added image to IPFS with hash', hash);
        messageContent.image = null;
        messageContent.imageHash = hash;
        addMessageToDb(messageContent);
    });
}

const handleSetChatThreadCommand = async (messageContent) => {
    const threadName = messageContent.value;
    await openMessagesDb(threadName);
    addMessagesDbEventHandlers();
    messagesDb.load();
    sendMessagesFromDbToClient();
}

const handleSaveUsernameCommand = async (messageContent) => {
    const username = messageContent.value;
    if (usersDb.get(username) === ipfsId) {
        console.log('Username', username, 'already assigned to the user in the DB.');
        broadcastChannel.postMessage({ command: 'saveUsername', success: true });
    }
    else if (usersDb.get(username)) {
        console.log('Username', username, 'already present in the DB.');
        broadcastChannel.postMessage({ command: 'saveUsername', success: false });
    }
    else {
        // clear old name
        let oldName = usersDb.get(ipfsId);
        await usersDb.put(oldName, undefined);
        await usersDb.put(username, ipfsId);
        console.log('Username', username, 'saved in the DB.');
        await usersDb.put(ipfsId, username);
        broadcastChannel.postMessage({ command: 'saveUsername', success: true });
    }
}

const addMessageToDb = (messageContent) => {
    messageContent.senderId = ipfsId;
    messageContent.date = + new Date();

    messagesDb.add(messageContent);
}

const pinContentToIpfsNode = (hash, successCallback) => {
    console.log('About to pin content using hash', hash);
    ipfsNode.pin.add(hash, (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Successfully pinned ' + hash, result);
        successCallback();
    })
}

const openMessagesDb = async (threadName) => {
    messagesDb = await orbitDbInstance.open(messagesDbName + '-' + threadName, messagesDbConfig);
    console.log('Feed DB created for messages with thread name', threadName);
}

const openUsersDb = async () => {
    usersDb = await orbitDbInstance.open(usersDbName, userDbConfig);
    console.log('Keyvalue DB created for usernames');
}

createProxyServer(() => ipfsNode, {
    addListener: self.addEventListener.bind(self),
    removeListener: self.removeEventListener.bind(self),
    async postMessage(data) {
        // TODO: post back to the client that sent the message?
        const clients = await self.clients.matchAll();
        clients.forEach(client => client.postMessage(data));
    }
})
