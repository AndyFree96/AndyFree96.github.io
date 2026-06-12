/** Mermaid bootstrap script generator. */
import { bootstrapMermaid } from "/js/lib/mermaid.js"

const mermaidSource = "https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs"
const zenumlSource = ""
const layoutLoaderSources = []
const mermaidConfig = {"cdn":"","fontfamily":"","layout":"dagre","layoutloaders":[],"look":"handDrawn","securitylevel":"loose","themes":["default","dark"],"wrapper":true,"zenuml":""}

void bootstrapMermaid({
  mermaidSource,
  zenumlSource,
  layoutLoaderSources,
  config: mermaidConfig,
})
