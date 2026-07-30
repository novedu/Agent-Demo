import type { RetrievedDocument } from './document';
import { KnowledgeBase } from './knowledge-base';

export interface RetrieveResult {
  query: string;
  documents: RetrievedDocument[];
  duration: number;
}

export class Retriever {
  constructor(private knowledgeBase: KnowledgeBase) {}

  retrieve(query: string, topK = 3): RetrieveResult {
    const startedAt = Date.now();
    const keywords = this.tokenize(query);

    const documents = this.knowledgeBase
      .listDocuments()
      .map((document) => {
        const searchableText = `${document.content} ${Object.values(document.metadata).join(' ')}`.toLowerCase();
        const matchedKeywords = keywords.filter(keyword => searchableText.includes(keyword));

        return {
          ...document,
          score: matchedKeywords.length,
          matchedKeywords,
        };
      })
      .filter(document => document.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return {
      query,
      documents,
      duration: Date.now() - startedAt,
    };
  }

  private tokenize(query: string): string[] {
    const rawTokens = query
      .toLowerCase()
      .split(/[\s,，。！？?;；:：、]+/)
      .map(token => token.trim())
      .filter(Boolean);

    const tokens = new Set<string>();

    for (const token of rawTokens) {
      tokens.add(token);

      const chineseText = token.replace(/[的是什么多少如何怎么请问一下]/g, '');
      if (chineseText.length > 0) {
        tokens.add(chineseText);
      }

      if (/^[\u4e00-\u9fa5]+$/.test(chineseText) && chineseText.length >= 2) {
        for (let i = 0; i < chineseText.length - 1; i++) {
          tokens.add(chineseText.slice(i, i + 2));
        }
      }
    }

    return Array.from(tokens).filter(token => token.length > 0);
  }
}
