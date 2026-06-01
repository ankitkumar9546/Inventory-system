module.exports = function override(config) {
  // Remove ForkTsCheckerWebpackPlugin — broken on Node 24 (ajv-keywords nested
  // node_modules use removed PyUnicode C APIs). TypeScript is still checked by
  // the editor's language server.
  config.plugins = config.plugins.filter(
    (plugin) =>
      plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin' &&
      plugin.constructor.name !== 'ESLintWebpackPlugin'
  );
  return config;
};
