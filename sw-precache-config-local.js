module.exports = {
    staticFileGlobs: [
        'build/static/css/**.css',
        'build/static/js/**.js',
        'build/index.html'
    ],
    swFilePath: './build/service-worker.js',
    stripPrefix: 'build/',
    importScripts: (['./service-worker-ipfs.js']),
    handleFetch: false
}