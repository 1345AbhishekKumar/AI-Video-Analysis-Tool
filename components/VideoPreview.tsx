
import React from 'react';
import { YouTubeVideo } from '../types';
import { ViewsIcon, LikesIcon, CommentsIcon } from '../constants';

interface VideoPreviewProps {
  video: YouTubeVideo;
}

const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

const VideoPreview: React.FC<VideoPreviewProps> = ({ video }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-auto object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1.5">
                <ViewsIcon />
                <span>{formatNumber(video.viewCount)} views</span>
            </div>
            <div className="flex items-center gap-1.5">
                <LikesIcon />
                <span>{formatNumber(video.likeCount)} likes</span>
            </div>
            <div className="flex items-center gap-1.5">
                <CommentsIcon />
                <span>{formatNumber(video.commentCount)} comments</span>
            </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed max-h-24 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {video.description}
        </p>

        {video.tags && video.tags.length > 0 && (
            <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                    {video.tags.slice(0, 5).map(tag => (
                        <span key={tag} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;
