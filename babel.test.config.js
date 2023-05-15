module.exports = {
  presets: [['@babel/preset-env', {
    modules: 'commonjs',
    targets: {
      node: 'current',
    },
  }], '@babel/preset-typescript', '@babel/preset-react'],
  plugins: ['@babel/proposal-class-properties',
    '@babel/plugin-proposal-private-property-in-object', '@babel/proposal-object-rest-spread', "@babel/transform-typescript", "@babel/plugin-proposal-private-methods"],
};
