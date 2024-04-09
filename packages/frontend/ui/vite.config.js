export default {
  envDir: '.',
  build:{
    sourcemap: true,
    rollupOptions: {
      external: ['node-fetch']
    },
  },
  worker: {
    format: 'es',
    sourcemap: true
  }
}
