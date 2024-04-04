export default {
  envDir: '.',
  build:{
    rollupOptions: {
      external: ['node-fetch']
    },
  },
  worker: {
    format: 'es'
  }
}
