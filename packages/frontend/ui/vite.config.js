export default {
  build:{
    rollupOptions: {
      external: ['node-fetch']
    },
  },
  worker: {
    format: 'es'
  }
}
