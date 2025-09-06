import React, { useState, useCallback } from 'react';
import { YouTubeVideo, HistoricalAnalysis, VideoAnalysis } from './types';
import { fetchVideoDetails } from './services/youtubeService';
import { analyzeVideoContent } from './services/geminiService';
import { addAnalysisToHistory, getHistoryForVideo } from './services/historyService';
import { YouTubeIcon, SparklesIcon, ErrorIcon } from './constants';
import VideoPreview from './components/VideoPreview';
import ScoreCard from './components/ScoreCard';
import AnalysisSection from './components/AnalysisSection';
import Loader from './components/Loader';
import HistorySidebar from './components/HistorySidebar';

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDetails, setVideoDetails] = useState<YouTubeVideo | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<HistoricalAnalysis | null>(null);
  const [historicalAnalyses, setHistoricalAnalyses] = useState<HistoricalAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getBase64FromUrl = async (url: string): Promise<string> => {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch thumbnail image via proxy. Status: ${response.status}. Please try again.`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error('FileReader did not return a string.'));
            }
            resolve(reader.result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  const handleAnalyzeClick = useCallback(async () => {
    setError(null);
    setVideoDetails(null);
    setSelectedAnalysis(null);
    setHistoricalAnalyses([]);

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid video link.');
      return;
    }

    setIsLoading(true);

    try {
      const details = await fetchVideoDetails(videoId);
      setVideoDetails(details);

      const thumbnailBase64 = await getBase64FromUrl(details.thumbnailUrl);
      
      const analysis = await analyzeVideoContent(details, thumbnailBase64);
      addAnalysisToHistory(videoId, analysis);

      const updatedHistory = getHistoryForVideo(videoId);
      setHistoricalAnalyses(updatedHistory);

      if (updatedHistory.length > 0) {
        setSelectedAnalysis(updatedHistory[0]); // Select the newest analysis
      }

    } catch (err) {
      console.error(err);
      setError(`An error occurred during analysis. Please check the console or try again. Details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [videoUrl]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-center sm:justify-start space-x-4 mb-8">
          <div className="text-red-500">{YouTubeIcon}</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">AI Video Analysis Tool</h1>
        </header>

        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3">Enter YouTube Video URL</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
              disabled={isLoading}
            />
            <button
              onClick={handleAnalyzeClick}
              disabled={isLoading || !videoUrl}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-lg transform hover:scale-105"
            >
              {isLoading ? 'Analyzing...' : <> <SparklesIcon /> Analyze Video </>}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-8 flex items-start gap-3">
            <div className="w-6 h-6 flex-shrink-0 mt-1"><ErrorIcon /></div>
            <div>
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {isLoading && <Loader />}

        {videoDetails && selectedAnalysis && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <VideoPreview video={videoDetails} />
              <HistorySidebar
                history={historicalAnalyses}
                selectedTimestamp={selectedAnalysis.timestamp}
                onSelectAnalysis={setSelectedAnalysis}
              />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <ScoreCard title="Title Score" score={selectedAnalysis.titleAnalysis.score} />
                <ScoreCard title="Thumbnail Score" score={selectedAnalysis.thumbnailAnalysis.score} />
                <ScoreCard title="Virality Score" score={selectedAnalysis.viralityScore} highlight />
              </div>
              
              <AnalysisSection title="Predicted Audience">
                <p className="text-gray-300">{selectedAnalysis.predictedAudience}</p>
              </AnalysisSection>

              <AnalysisSection title="Performance Summary">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-green-400 mb-1">What's Working (Why it could be viral)</h3>
                    <p className="text-gray-300">{selectedAnalysis.whyViral}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-yellow-400 mb-1">Title Analysis</h3>
                    <p className="text-gray-300">{selectedAnalysis.titleAnalysis.feedback}</p>
                  </div>
                   <div>
                    <h3 className="font-bold text-lg text-yellow-400 mb-1">Description Analysis</h3>
                    <p className="text-gray-300">{selectedAnalysis.descriptionAnalysis.feedback}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-yellow-400 mb-1">Thumbnail Analysis</h3>
                    <p className="text-gray-300">{selectedAnalysis.thumbnailAnalysis.feedback}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-yellow-400 mb-1">Engagement Analysis</h3>
                    <p className="text-gray-300">{selectedAnalysis.engagementAnalysis.feedback}</p>
                  </div>
                </div>
              </AnalysisSection>

              <AnalysisSection title="Improvement Suggestions">
                 <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-100 mb-2">Suggested Titles:</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                            {selectedAnalysis.suggestions.titles.map((title, index) => <li key={index}>{title}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold text-gray-100 mb-2">Suggested Description:</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{selectedAnalysis.suggestions.description}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-gray-100 mb-2">Thumbnail Improvement:</h3>
                        <p className="text-gray-300">{selectedAnalysis.suggestions.thumbnail}</p>
                    </div>
                 </div>
              </AnalysisSection>

              <AnalysisSection title="Top 3 Action Items">
                 <ul className="space-y-3">
                    {selectedAnalysis.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full text-white font-bold flex items-center justify-center mt-1">{index + 1}</div>
                            <p className="text-gray-300">{item}</p>
                        </li>
                    ))}
                 </ul>
              </AnalysisSection>
            </div>
          </div>
        )}

      </div>
       <footer className="text-center text-gray-500 mt-12 pb-4">
        <p>Powered by Gemini API. For educational and illustrative purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
