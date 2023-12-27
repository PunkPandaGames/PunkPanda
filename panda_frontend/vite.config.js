import { defineConfig } from 'vite';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import ViteRequireContext from '@originjs/vite-plugin-require-context';
import requireTransform from 'vite-plugin-require-transform';
import viteCompression from 'vite-plugin-compression';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver, VantResolver } from 'unplugin-vue-components/resolvers';
import postcsspxtoviewport from 'postcss-px-to-viewport';
import { getEnv } from './src/utils/buildTestnet';
import UnoCSS from 'unocss/vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

import vue from '@vitejs/plugin-vue';
import path from 'path';
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import';


function getUiVw(size, name) {
  return {
    unitToConvert: name, 
    viewportWidth: size, 
    unitPrecision: 6,
    propList: ['*'],
    viewportUnit: 'vw', 
    fontViewportUnit: 'vw', 
    minPixelValue: 0, 
    mediaQuery: true, 
    replace: true, 
    exclude: [],
    landscape: false, 
  };
}

export default (config) => {
  // 
  return defineConfig({
    base: getEnv(config.mode).viteBase,

    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@import "./src/assets/css/var.scss"; @import "./src/assets/css/mixins.scss"; @import "./src/assets/css/mediaSize.scss"; @import "./src/assets/css/mediaUnit.scss"; @import "./src/assets/css/theme.scss";',
        },
      },

      postcss: {
        plugins: [
          postcsspxtoviewport(getUiVw(1280, 'pm')),
          postcsspxtoviewport(getUiVw(1920, 'pw')),
        ],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@css': path.resolve(__dirname, './src/assets/css'),
        '@cps': path.resolve(__dirname, './src/components'),
        '@img': path.resolve(__dirname, './src/assets/img'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@store': path.resolve(__dirname, './src/store'),
        '@contApi': path.resolve(__dirname, './src/contractsApi'),
        '@tools': path.resolve(__dirname, './src/utils/tools'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
      },

      // 
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs'],
    },
    plugins: [
      vue(),
      viteCommonjs(),
      ViteRequireContext(),
      requireTransform({}),
      viteCompression(),
      UnoCSS(),

      AutoImport({
        imports: ['vue', 'vue-router'], // 
        include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
        dts: 'src/auto-import.d.ts', // 
        resolvers: [ElementPlusResolver()],
        dirs: ['./preFunc/**'],
      }),

      Components({
        // allow auto load markdown components under `./src/components/`
        extensions: ['vue', 'md'], // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        dts: 'src/components.d.ts',
        resolvers: [ElementPlusResolver(), VantResolver()],
      }),

      createStyleImportPlugin({
        resolves: [ElementPlusResolve()],
      }),

      // image
      ViteImageOptimizer({
        test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
        exclude: undefined,
        include: undefined,
        includePublic: true,
        logStats: true,
        ansiColors: true,
        svg: {
          multipass: true,
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  cleanupNumericValues: false,
                  removeViewBox: false, // https://github.com/svg/svgo/issues/1128
                },
                cleanupIDs: {
                  minify: false,
                  remove: false,
                },
                convertPathData: false,
              },
            },
            'sortAttrs',
            {
              name: 'addAttributesToSVGElement',
              params: {
                attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
              },
            },
          ],
        },
        png: {
          // https://sharp.pixelplumbing.com/api-output#png
          quality: 100,
        },
        jpeg: {
          // https://sharp.pixelplumbing.com/api-output#jpeg
          quality: 100,
        },
        jpg: {
          // https://sharp.pixelplumbing.com/api-output#jpeg
          quality: 100,
        },
        tiff: {
          // https://sharp.pixelplumbing.com/api-output#tiff
          quality: 100,
        },
        // gif does not support lossless compression
        // https://sharp.pixelplumbing.com/api-output#gif
        gif: {},
        webp: {
          // https://sharp.pixelplumbing.com/api-output#webp
          lossless: true,
        },
        avif: {
          // https://sharp.pixelplumbing.com/api-output#avif
          lossless: true,
        } /* pass your config */,
      }),
    ],

    build: {
      rollupOptions: {
        external: ['parallax-js'],
      },
      outDir: './dist',
    },

    esbuild: {
      pure: ['console.log'],
      minify: true,
    },

    server: {
      port: 3100,
      open: false,
      https: false,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:9800',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/'),
        },
      },
    },
  });
};
