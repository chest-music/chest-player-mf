import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import url from 'rollup-plugin-url';
import reactSvg from 'rollup-plugin-react-svg';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
      }
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
      }
    },
  ],
  plugins: [
    peerDepsExternal(),
    reactSvg({
      svgo: {
        plugins: [],
        multipass: true
      },
      jsx: true,
      include: '**/*.svg'
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    url({
      include: ['**/*.png', '**/*.jpg', '**/*.gif'],
      limit: 8192, // 8kb
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', { modules: false }],
        ['@babel/preset-react', { runtime: 'classic' }],
      ],
      extensions: ['.js', '.jsx', '.svg'],
    }),
    commonjs(),
    postcss({
      extract: true,
      minimize: true,
    }),
    terser(),
  ],
  external: [
    'react',
    'react-dom',
    'react-redux',
    '@reduxjs/toolkit',
    'framer-motion',
    '@heroicons/react/24/outline',
  ],
};