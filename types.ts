export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  tags: string[];
  uploadDate: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  channelSubscribers: number;
}

export interface VideoAnalysis {
  titleAnalysis: {
    score: number; // 0-100
    feedback: string;
  };
  descriptionAnalysis: {
    score: number; // 0-100. This field is requested but might not be used in UI, included for completeness
    feedback: string;
  };
  thumbnailAnalysis: {
    score: number; // 0-100
    feedback: string;
  };
  engagementAnalysis: {
    feedback: string;
  };
  viralityScore: number; // 0-100
  whyViral: string; // Explains positive aspects
  suggestions: {
    titles: string[];
    description: string;
    thumbnail: string;
  };
  predictedAudience: string;
  actionItems: string[];
}

export interface HistoricalAnalysis extends VideoAnalysis {
  timestamp: string;
}
