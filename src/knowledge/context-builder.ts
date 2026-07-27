import type { RetrievedDocument } from './document';

export interface RagContext {
  query: string;
  context: string;
  documents: RetrievedDocument[];
  documentCount: number;
}

export class ContextBuilder {
  build(query: string, documents: RetrievedDocument[]): RagContext {
    const context = documents
      .map((document, index) => {
        const title = typeof document.metadata.title === 'string'
          ? document.metadata.title
          : document.id;
        return `[${index + 1}] ${title}\n${document.content}`;
      })
      .join('\n\n');

    return {
      query,
      context,
      documents,
      documentCount: documents.length,
    };
  }
}

