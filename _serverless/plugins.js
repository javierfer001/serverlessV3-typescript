const esbuildPluginTsc = require('esbuild-plugin-tsc')
// default export should be an array of plugins
module.exports = [
    esbuildPluginTsc({
        tsconfigPath: './tsconfig.json',
        force: true,
    }),
]
