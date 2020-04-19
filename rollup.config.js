import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;

const bundles = [];

bundles.push({
	input: 'src/index.js',
	output: [
		{ file: pkg.module, 'format': 'es' },
		{ file: pkg.main, 'format': 'cjs'}
	],
	plugins: [
		resolve({dedupe: ['svelte']}),
		production && terser()
	]
});

bundles.push({
	input: 'src/index.js',
	output: { 
		file: pkg.svelte, 
		'format': 'es'
	},
	external:['svelte','svelte/store','aovi'],
	plugins: [
		production && terser()
	]
});

if(!production) bundles.push({
	input: 'tests/app.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'tests/www/build/bundle.js'
	},
	plugins: [
		svelte({
			dev: true,
			css: css => {
				css.write('tests/www/build/bundle.css');
			}
		}),
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		serve(),
        livereload('tests/www')
	],
	watch: {
		clearScreen: false
	}
});

function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'serve'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}

export default bundles;