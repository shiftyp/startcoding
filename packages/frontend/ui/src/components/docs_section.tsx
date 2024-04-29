import AccordionDetails from '@mui/joy/AccordionDetails'
import AccordionSummary from '@mui/joy/AccordionSummary'
import React , { PropsWithChildren } from 'react'
import documentationMenus from "@startcoding/types/documentation";
import { keyframes } from '@emotion/react';
import Accordion from '@mui/joy/Accordion';
import Markdown from 'react-markdown';

export const DocsSection = ({ section, color, blockHeight, children }: PropsWithChildren<{ section: Omit<keyof typeof documentationMenus, "Sprites & Backgrounds">, color: `#${string}`, blockHeight: number }>) => {
  // @ts-expect-error
  const items = documentationMenus[section].map(info => (
    <li>
      <ul style={{ listStyle: "none", margin: '0.75em 0 0.75em 0', padding: '0.75em 0 0.75em 0', borderTop: info.use ? "5px dotted #444" : 'none' }}>
        {info.use ? <li>
          <svg style={{ width: "100%" }} height={info.use.reduce((height, { blockHeight }) => height + blockHeight, 0) + 10 * (info.use.length - 1)}>
            {info.use.reduce(({ ret, height }, { href, blockHeight }) => ({ ret: [...ret, <use transform={`translate(${10}, ${height})`} href={`#${href}`}></use>], height: height + blockHeight + 10 }), { ret: [], height: 0 }).ret}
          </svg>
        </li> : null}
        {info.description ? <Markdown>{info.description}</Markdown> : null}
        {info.code ? <li>
          <pre aria-label="Click or Press Enter to Copy Code Snippet" tabIndex={1} className="code-snippet" onClick={(e) => {
            const pre = e!.target! as HTMLPreElement
            navigator.clipboard.writeText(pre.innerHTML)
          }} onKeyDown={(e) => {
            const pre = e!.target! as HTMLPreElement
            if (e.key == 'return' || e.key === 'enter') {
              navigator.clipboard.writeText(pre.innerHTML)
            }
          }}
            style={{ backgroundColor: color + '22' }}>{info.code}</pre>
        </li> : null}
      </ul>
    </li>
  ))

  return (
    <Accordion>
      <AccordionSummary
        sx={{
          backgroundColor: color
        }}
      >
        {section}
      </AccordionSummary>
      <AccordionDetails>
        {children}
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {
            items
          }
        </ul>
      </AccordionDetails>
    </Accordion>
  );
}