import { YouTubeVideo } from '../types';

/**
 * This is a hybrid service. To avoid requiring a YouTube Data API v3 key,
 * it fetches publicly available information (like the title) using YouTube's oEmbed endpoint,
 * which doesn't require authentication.
 *
 * However, detailed statistics (views, likes, description, etc.) are still mocked
 * as they are not available from the oEmbed endpoint. This provides a realistic
 * user experience where the correct video is identified, while still being able to
 * run in any environment without API keys.
 */
export const fetchVideoDetails = async (videoId: string): Promise<YouTubeVideo> => {
  console.log(`Fetching details for video ID: ${videoId} using oEmbed`);

  // Use a CORS proxy to fetch from the oEmbed endpoint
  const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(oEmbedUrl)}`;

  let videoTitle = 'Title could not be fetched'; // Default title

  try {
    const response = await fetch(proxyUrl);
    if (response.ok) {
        const data = await response.json();
        videoTitle = data.title;
    } else {
        console.warn(`Failed to fetch oEmbed data. Status: ${response.status}. Using a placeholder title.`);
        videoTitle = 'Sample Video Title (oEmbed fetch failed)';
    }
  } catch (error) {
      console.error('Error fetching oEmbed data:', error);
      videoTitle = 'Sample Video Title (Error in oEmbed fetch)';
  }

  // Combine fetched data with realistic mock data for other fields.
  const videoDetails: YouTubeVideo = {
    id: videoId,
    title: videoTitle, // Use the fetched title
    description: `This is a sample description for the video titled "${videoTitle}". In a real application with a YouTube API key, this would be the video's actual description. It would detail the content, provide links to social media, and include relevant hashtags to improve discoverability.
    
Timestamps:
0:00 - Intro
1:30 - Key Point 1
3:45 - Demonstration
5:20 - Common Mistakes
7:00 - Conclusion & Call to Action
    
#sample #mockdata #youtubeanalysis`,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    tags: ['video analysis', 'sample tag', 'mock data', 'seo'],
    uploadDate: '2023-10-26T14:00:00Z',
    duration: '08:15',
    viewCount: Math.floor(Math.random() * 5000000) + 10000, // Randomize stats
    likeCount: Math.floor(Math.random() * 200000) + 500,
    commentCount: Math.floor(Math.random() * 15000) + 100,
    channelSubscribers: Math.floor(Math.random() * 2000000) + 50000,
  };

  return videoDetails;
};
