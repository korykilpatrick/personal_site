const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

const SITE_ORIGIN = 'https://korykilpatrick.com';

function pageUrl(routePath) {
  return new URL(routePath, SITE_ORIGIN).toString();
}

function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

class StaticSeoPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('StaticSeoPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'StaticSeoPlugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          const urls = ['/', '/bookshelf'];
          const sitemapEntries = urls
            .map((routePath) => {
              return [
                '  <url>',
                `    <loc>${xmlEscape(pageUrl(routePath))}</loc>`,
                '  </url>',
              ].join('\n');
            })
            .join('\n');
          const sitemap = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            sitemapEntries,
            '</urlset>',
            '',
          ].join('\n');
          const robots = [
            'User-agent: *',
            'Allow: /',
            `Sitemap: ${pageUrl('/sitemap.xml')}`,
            '',
          ].join('\n');

          compilation.emitAsset('sitemap.xml', new webpack.sources.RawSource(sitemap));
          compilation.emitAsset('robots.txt', new webpack.sources.RawSource(robots));
        },
      );
    });
  }
}

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';
  const isPostsPreview = process.env.POSTS_PREVIEW === '1';
  const postsEnabled = !isProduction || isPostsPreview || process.env.POSTS_ENABLED === '1';
  const nodeMajorVersion = Number.parseInt(process.versions.node.split('.')[0], 10);
  const canUseCssMinimizer =
    isProduction && nodeMajorVersion >= 20 && typeof globalThis.crypto !== 'undefined';

  return {
    entry: './frontend/src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: '/',
      clean: isProduction,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'frontend/src'),
        '@types': path.resolve(__dirname, 'types'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: 'ts-loader',
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        pageMeta: {
          title: 'Kory Kilpatrick',
          description:
            'Kory Kilpatrick writes about poker, AI, learning, judgment, and the games beneath ordinary work.',
          canonicalUrl: pageUrl('/'),
          type: 'website',
          robots: 'index, follow',
        },
      }),
      new DotenvWebpackPlugin({
        systemvars: true,
      }),
      new webpack.DefinePlugin({
        'process.env.REACT_APP_API_BASE_URL': JSON.stringify(
          process.env.REACT_APP_API_BASE_URL || '/api',
        ),
        'process.env.REACT_APP_POSTS_ENABLED': JSON.stringify(String(postsEnabled)),
        'process.env.REACT_APP_POSTS_PREVIEW': JSON.stringify(String(isPostsPreview)),
      }),
      ...(isProduction && postsEnabled
        ? [
            new HtmlWebpackPlugin({
              template: './public/index.html',
              filename: 'posts/index.html',
              pageMeta: {
                title: 'Posts · Kory Kilpatrick',
                description:
                  'Essays and shorter notes by Kory Kilpatrick on poker, AI, learning, attention, and the other games he cannot stop trying to solve.',
                canonicalUrl: pageUrl('/posts'),
                type: 'website',
                robots: isPostsPreview ? 'noindex, nofollow' : 'index, follow',
              },
            }),
          ]
        : []),
      ...(isProduction
        ? [
            new HtmlWebpackPlugin({
              template: './public/index.html',
              filename: '404.html',
              pageMeta: {
                title: 'Page not found · Kory Kilpatrick',
                description: 'That page is not part of Kory Kilpatrick’s site.',
                canonicalUrl: pageUrl('/404'),
                type: 'website',
                robots: 'noindex, nofollow',
              },
            }),
            new StaticSeoPlugin(),
          ]
        : []),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: 'styles.css',
              chunkFilename: '[name].css',
            }),
          ]
        : []),
    ],
    optimization: {
      minimizer: isProduction
        ? canUseCssMinimizer
          ? ['...', new CssMinimizerPlugin()]
          : ['...']
        : undefined,
    },
    devServer: {
      historyApiFallback: true,
      port: process.env.PORT ? Number(process.env.PORT) : 3000,
      hot: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          secure: false,
          changeOrigin: true,
        },
      },
    },
  };
};
