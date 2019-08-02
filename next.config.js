const withCSS = require('@zeit/next-css');

if (typeof require !== 'undefined') {
    require.extensions['.css'] = file => {};
}

module.exports = withCSS({
    webpack: function(config, { dev }) {
        config.module.rules.push({
            test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 100000,
                    name: '[name].[ext]'
                }
            }
        });
        if (dev) {
            config.devtool = 'cheap-module-source-map';
        }
        return config;
    }
});
