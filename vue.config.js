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
                    'font-family': "'Montserrat', sans-serif",
                },
                javascriptEnabled: true
            }
        }
    }
};