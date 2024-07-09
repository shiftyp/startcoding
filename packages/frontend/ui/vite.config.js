import typescript from '@rollup/plugin-typescript';

export default {
  envDir: '.',
  plugins: [
    typescript()
  ],
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
