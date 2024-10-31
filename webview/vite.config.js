import react from "@vitejs/plugin-react";
const config = {
    plugins: [react()],
    build: {
        minify: 'esbuild',
        outDir: "build",
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
            },
        },
    },
    server: {
        port: 3000,
        hmr: {
            protocol: "ws",
            host: "localhost",
        },
    },
};
export default config;
