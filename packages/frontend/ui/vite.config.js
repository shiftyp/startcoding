export default {
  envDir: '.',
  build:{
    sourcemap: true,
    rollupOptions: {
      external: ['node-fetch']
    },
    target: 'chrome91',
  },
  worker: {
    format: 'es',
    sourcemap: true
  }
}
