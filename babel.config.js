module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-react',
      '@babel/preset-typescript'
    ],
    plugins: [
      'babel-plugin-transform-typescript-metadata',
      '@babel/plugin-transform-react-jsx',
      require.resolve('react-native-reanimated/plugin'),
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": null,
        "safe": false,
        "allowUndefined": true
      }],
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json'
          ],
          alias: {
            '@components': './habit-spark/components',
            '@screens': './habit-spark/screens',
            '@store': './habit-spark/store',
            '@utils': './habit-spark/utils',
            '@config': './habit-spark/config',
            '@api': './api/*'
          }
        }
      ]
    ]
  }
} 