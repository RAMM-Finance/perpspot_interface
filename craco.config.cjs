/* eslint-disable @typescript-eslint/no-var-requires */
const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { DefinePlugin } = require('webpack')
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const path = require('path')
const commitHash = require('child_process').execSync('git rev-parse HEAD')


const isProduction = process.env.NODE_ENV === 'production'

// Linting and type checking are only necessary as part of development and testing.
// Omit them from production builds, as they slow down the feedback loop.
const shouldLintOrTypeCheck = !isProduction

module.exports = {
  babel: {
    plugins: [[
      '@babel/plugin-transform-typescript',
      {
        allowDeclareFields: true,
      },
    ], '@vanilla-extract/babel-plugin'
  ],
    env: {
      test: {
        plugins: ['istanbul'],
      },
      development: {
        plugins: ['istanbul'],
      },
    },
    loaderOptions: (babelLoaderOptions) => {
      const origBabelPresetCRAIndex = babelLoaderOptions.presets.findIndex((preset) => {
        return preset[0].includes('babel-preset-react-app')
      })

      const origBabelPresetCRA = babelLoaderOptions.presets[origBabelPresetCRAIndex]

      babelLoaderOptions.presets[origBabelPresetCRAIndex] = function overridenPresetCRA(api, opts, env) {
        const babelPresetCRAResult = require(origBabelPresetCRA[0])(api, origBabelPresetCRA[1], env)

        babelPresetCRAResult.presets.forEach((preset) => {
          // detect @babel/preset-react with {development: true, runtime: 'automatic'}
          const isReactPreset =
            preset && preset[1] && preset[1].runtime === 'automatic' && preset[1].development === true
          if (isReactPreset) {
            preset[1].importSource = '@welldone-software/why-did-you-render'
          }
        })

        return babelPresetCRAResult
      }

      return babelLoaderOptions
    },
  },
  typescript: {
    enableTypeChecking: true /* (default value) */,
  },
  eslint: {
    enable: shouldLintOrTypeCheck,
    pluginOptions(eslintConfig) {
      return Object.assign(eslintConfig, {
        cache: true,
        cacheLocation: getCacheDirectory('eslint'),
        ignorePath: '.gitignore',
        // Use our own eslint/plugins/config, as overrides interfere with caching.
        // This ensures that `yarn start` and `yarn lint` share one cache.
        eslintPath: require.resolve('eslint'),
        resolvePluginsRelativeTo: null,
        baseConfig: null,
      })
    },
  },
  jest: {
    configure(jestConfig) {
      return Object.assign({}, jestConfig, {
       transformIgnorePatterns: ['@uniswap/conedison/format', '@uniswap/conedison/provider'],
       moduleNameMapper: {
         '@uniswap/conedison/format': '@uniswap/conedison/dist/format',
         '@uniswap/conedison/provider': '@uniswap/conedison/dist/provider',
       },
      })
    },
  },
  webpack: {
    alias: {
      'react-redux': process.env.NODE_ENV === 'development' ? 'react-redux/lib' : 'react-redux',
    },
    plugins: [
      new VanillaExtractPlugin({ identifiers: 'short' }),
      new DefinePlugin({
        'process.env.REACT_APP_GIT_COMMIT_HASH': JSON.stringify(commitHash.toString()),
      }),
    ],
    configure: (webpackConfig) => {
      const instanceOfMiniCssExtractPlugin = webpackConfig.plugins.find(
        (plugin) => plugin instanceof MiniCssExtractPlugin
      )
      if (instanceOfMiniCssExtractPlugin !== undefined) instanceOfMiniCssExtractPlugin.options.ignoreOrder = true

      const moduleScopePlugin = webpackConfig.resolve.plugins.find(
        (plugin) => plugin instanceof ModuleScopePlugin
      );
      moduleScopePlugin.allowedPaths.push(
        path.resolve(
          __dirname, 
          "node_modules/@vanilla-extract/webpack-plugin"
        )
      );

      return webpackConfig
    },
  },
}