import envFilePlugin from "esbuild-envfile-plugin"
import { build }  from 'esbuild'

build({
  entryPoints: ["./src/service-worker.ts"],
  format: "iife",
  bundle: true,
  outfile: "public/service-worker.js",
  plugins: [envFilePlugin],
});
