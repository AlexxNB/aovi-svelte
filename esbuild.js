const { build } = require('esbuild');
const { derver } = require("derver");
const sveltePlugin = require("esbuild-svelte");
const pkg = require('./package.json');

const DEV = process.argv.includes('--dev');

// Node-module
build({
    entryPoints: ['./src/index.js'],
    format: "esm",
    outfile: pkg.module,
    minify: !DEV,
    sourcemap: DEV && 'inline',
    bundle: true,
    external: ['svelte','aovi'],
    incremental: DEV,
}).then( bundle_module => {
    if(DEV){
        // Test app
        build({
            entryPoints: ['tests/app/src/app.js'],
            bundle: true,
            outfile: 'tests/app/www/build/bundle.js',
            mainFields: ['svelte','module','main'],
            minify: false,
            incremental: true,
            sourcemap: 'inline',  
            plugins: [
                sveltePlugin({ compileOptions: {dev: true,css: true} })
            ]
        }).then( bundle_app => {
            derver({
                dir: 'tests/app/www',
                watch:['tests/app/www','tests/app/src','src'],
                onwatch: async (lr,item)=>{
                    if(item.endsWith('src')){
                        lr.prevent();
                        await bundle_module.rebuild().catch(err => lr.error(err.message,'aovi-svelte module error'));
                        await bundle_app.rebuild().catch(err => lr.error(err.message,'Svelte compile error'));
                    }
                }
            })
        })
    }
}).catch((e) => {
    process.exit(1);
})

if(!DEV){
    // Browser
    build({
        entryPoints: ['./src/index.js'],
        format: "iife",
        outfile: pkg.cdn,
        minify: !DEV,
        bundle: true,
        globalName: 'Aovi',
    }).catch((e) => {
        process.exit(1);
    })
}