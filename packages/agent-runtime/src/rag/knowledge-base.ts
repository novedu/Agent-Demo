import type { Document } from './document';

export class KnowledgeBase {
  private documents: Document[] = [];

  addDocument(document: Document): void {
    this.documents.push(document);
  }

  listDocuments(): Document[] {
    return [...this.documents];
  }
}

