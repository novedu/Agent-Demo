export interface Document {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
}

export interface RetrievedDocument extends Document {
  score: number;
  matchedKeywords: string[];
}

