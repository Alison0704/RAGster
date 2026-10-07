import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './MarkdownContent.module.css'

const components: Components = {
  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
}

type MarkdownContentProps = {
  source: string
}

/** Renders instructor-written Markdown (GitHub flavoured). Raw HTML in the source is ignored. */
function MarkdownContent({ source }: MarkdownContentProps) {
  return (
    <div className={styles.markdown}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </Markdown>
    </div>
  )
}

export default MarkdownContent
