import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Post } from '@/hooks/usePosts';
import { useLikePost, useUnlikePost } from '@/hooks/useLikes';
import { useDeletePost } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import CommentsSheet from './CommentsSheet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const { user } = useAuth();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const deletePost = useDeletePost();

  const isOwner = user?.id === post.user_id;

  const handleLike = async () => {
    if (!user) return;
    
    setIsLikeAnimating(true);
    try {
      if (post.is_liked) {
        await unlikePost.mutateAsync(post.id);
      } else {
        await likePost.mutateAsync(post.id);
      }
    } catch (error) {
      toast.error('Failed to update like');
    }
    setTimeout(() => setIsLikeAnimating(false), 300);
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(post.id);
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleDoubleClick = () => {
    if (!post.is_liked && user) {
      handleLike();
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl shadow-card overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Link
            to={`/profile/${post.profile?.username}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.profile?.avatar_url} />
              <AvatarFallback className="gradient-primary text-primary-foreground">
                {post.profile?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.profile?.name}</p>
              <p className="text-sm text-muted-foreground">@{post.profile?.username}</p>
            </div>
          </Link>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Image */}
        <div
          className="relative aspect-square bg-secondary cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={post.image_url}
            alt={post.caption || 'Post image'}
            className="w-full h-full object-cover"
          />
          
          {/* Heart animation on double click */}
          {isLikeAnimating && post.is_liked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-24 h-24 text-primary-foreground fill-primary drop-shadow-lg" />
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={handleLike}
              className={cn(
                'transition-transform hover:scale-110',
                isLikeAnimating && 'animate-heart'
              )}
            >
              <Heart
                className={cn(
                  'w-7 h-7 transition-colors',
                  post.is_liked ? 'fill-primary text-primary' : 'text-foreground'
                )}
              />
            </button>
            <button
              onClick={() => setShowComments(true)}
              className="transition-transform hover:scale-110"
            >
              <MessageCircle className="w-7 h-7" />
            </button>
          </div>

          {/* Likes count */}
          <p className="font-semibold mb-1">
            {post.likes_count || 0} {post.likes_count === 1 ? 'like' : 'likes'}
          </p>

          {/* Caption */}
          {post.caption && (
            <p className="text-sm">
              <Link to={`/profile/${post.profile?.username}`} className="font-semibold mr-2">
                {post.profile?.username}
              </Link>
              {post.caption}
            </p>
          )}

          {/* Comments preview */}
          {(post.comments_count || 0) > 0 && (
            <button
              onClick={() => setShowComments(true)}
              className="text-sm text-muted-foreground mt-1 hover:text-foreground transition-colors"
            >
              View all {post.comments_count} comments
            </button>
          )}

          {/* Time */}
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </motion.article>

      <CommentsSheet
        postId={post.id}
        open={showComments}
        onOpenChange={setShowComments}
      />
    </>
  );
}
