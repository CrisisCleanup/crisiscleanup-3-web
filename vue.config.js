module.exports = {
    runtimeCompiler: true,
    configureWebpack: {
        devtool: 'source-map'
    },
    css: {
        loaderOptions: {
            less: {
                modifyVars: {
                    'primary-color': '#FECE09',
                    'link-color': '#FECE09',
                    'text-color': '#000000',
                    'layout-header-background': '#353535',
                    'font-family': "'Nunito Sans', sans-serif",
                },
                javascriptEnabled: true
            }
        }
    }
};