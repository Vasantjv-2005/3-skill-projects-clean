import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { Post } from '@/hooks/usePosts';
import PostCard from './PostCard';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PostGridItemProps {
  post: Post;
}

export default function PostGridItem({ post }: PostGridItemProps) {
  const [showPost, setShowPost] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPost(true)}
        className="relative aspect-square bg-secondary overflow-hidden group"
      >
        <img
          src={post.image_url}
          alt={post.caption || 'Post'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 fill-white" />
            <span className="font-semibold">{post.likes_count || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 fill-white" />
            <span className="font-semibold">{post.comments_count || 0}</span>
          </div>
        </div>
      </button>

      <Dialog open={showPost} onOpenChange={setShowPost}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <PostCard post={post} />
        </DialogContent>
      </Dialog>
    </>
  );
}
