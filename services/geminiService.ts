import { GoogleGenAI, Type } from "@google/genai";
import { YouTubeVideo, VideoAnalysis } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        titleAnalysis: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Score from 0-100 for title SEO, emotional hook, and CTR potential." },
                feedback: { type: Type.STRING, description: "Detailed feedback on the title's strengths and weaknesses." }
            }
        },
        descriptionAnalysis: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Score from 0-100 for description keyword density, clarity, and use of links/hashtags." },
                feedback: { type: Type.STRING, description: "Detailed feedback on the description." }
            }
        },
        thumbnailAnalysis: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "Score from 0-100 for thumbnail readability, color contrast, and emotional impact." },
                feedback: { type: Type.STRING, description: "Feedback on the thumbnail, mentioning face presence, text clarity, and visual appeal." }
            }
        },
        engagementAnalysis: {
            type: Type.OBJECT,
            properties: {
                feedback: { type: Type.STRING, description: "Analysis of engagement (views, likes) relative to subscriber count." }
            }
        },
        viralityScore: {
            type: Type.NUMBER,
            description: "A score from 0-100 indicating the video's potential to go viral."
        },
        whyViral: {
            type: Type.STRING,
            description: "A plain English explanation of what works well in the video (hooks, title, etc.) that could make it go viral."
        },
        suggestions: {
            type: Type.OBJECT,
            properties: {
                titles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 alternative, SEO-optimized titles."
                },
                description: {
                    type: Type.STRING,
                    description: "A suggestion for an improved, keyword-rich description."
                },
                thumbnail: {
                    type: Type.STRING,
                    description: "A suggestion for a better thumbnail concept (e.g., 'Use a close-up shot with bright, bold text')."
                }
            }
        },
        predictedAudience: {
            type: Type.STRING,
            description: "A description of the most likely audience for this video."
        },
        actionItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of the top 3 most impactful actions the creator can take to improve this video's performance."
        }
    }
};

export const analyzeVideoContent = async (video: YouTubeVideo, thumbnailBase64: string): Promise<VideoAnalysis> => {
    const model = 'gemini-2.5-flash';

    const textPrompt = `
    Act as an expert YouTube growth strategist. Analyze the provided YouTube video metadata and thumbnail image.
    Your analysis should be critical, insightful, and provide actionable advice.
    
    Video Metadata:
    - Title: ${video.title}
    - Description: ${video.description}
    - Tags: ${video.tags.join(', ')}
    - View Count: ${video.viewCount}
    - Like Count: ${video.likeCount}
    - Comment Count: ${video.commentCount}
    - Channel Subscribers: ${video.channelSubscribers}

    Based on the metadata and the thumbnail, perform the following analysis and provide the output in a structured JSON format that adheres strictly to the provided schema.
    
    1.  **Title Analysis:** Evaluate for SEO, length, keyword usage, emotional hooks, and click-through rate (CTR) potential. Is it compelling?
    2.  **Description Analysis:** Check for keyword density, clarity, presence of relevant links, and effective use of hashtags.
    3.  **Thumbnail Analysis:** Analyze the provided image for visual appeal. Assess its readability, color contrast, use of faces, and overall clarity. Does it grab attention?
    4.  **Engagement Analysis:** Specifically analyze the engagement metrics relative to the channel subscriber count. Compare the view count, like count, and comment count to the subscriber number. Based on this comparison, provide detailed feedback on whether the engagement is strong, average, or weak for a channel of this size.
    5.  **Virality Score:** Provide an overall score (0-100) for the video's potential to go viral based on all factors.
    6.  **Why Viral / Why Not:** Explain in plain English the key factors contributing to or detracting from its virality potential.
    7.  **Suggestions:** Provide concrete suggestions for improvement:
        - Suggest 3 better, SEO-optimized titles.
        - Suggest an improved description.
        - Suggest a concept for a more effective thumbnail.
    8.  **Predicted Audience:** Describe the target audience for this video.
    9.  **Action Items:** List the top 3 most important, actionable steps the creator should take.

    Your response must be a single JSON object.
    `;

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: thumbnailBase64,
        },
    };

    const textPart = {
        text: textPrompt,
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            }
        });

        const jsonString = response.text;
        const result: VideoAnalysis = JSON.parse(jsonString);

        // --- Data Sanitization: Ensure exactly 3 title suggestions ---
        // Get current titles, filter out non-strings/empty values, and get unique titles.
        const currentTitles = result.suggestions?.titles || [];
        const uniqueTitles = [...new Set(currentTitles.filter(t => typeof t === 'string' && t.trim()))];
        
        // Truncate to 3 if we have too many.
        let finalTitles = uniqueTitles.slice(0, 3);
        
        // Pad with placeholders if we have too few.
        const placeholders = [
            'A/B Test This Title',
            'Try a More Emotional Angle',
            'Add a Keyword-Rich Title'
        ];
        
        let i = 0;
        while (finalTitles.length < 3) {
            finalTitles.push(placeholders[i]);
            i++;
        }

        result.suggestions.titles = finalTitles;
        // --- End of Data Sanitization ---

        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get analysis from Gemini API.");
    }
};