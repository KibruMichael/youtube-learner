export interface TranscriptLine {
  timestamp: string;
  text: string;
}

export interface VideoData {
  id: string;
  youtubeId: string;
  url: string;
  title: string;
  createdAt: number;
  // In a real app, these would be populated by the API.
  // We allow them to be undefined to represent the "loading/generating" state logic if we were fetching async.
  insights?: string[];
  transcript?: TranscriptLine[];
}

export type ViewState = 'home' | 'analysis';