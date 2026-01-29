import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useComments, useAddComment, useDeleteComment } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface CommentsSheetProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommentsSheet({ postId, open, onOpenChange }: CommentsSheetProps) {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useComments(postId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      await addComment.mutateAsync({ postId, text: newComment.trim() });
      setNewComment('');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync({ commentId, postId });
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100%-8rem)] py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <Link to={`/profile/${comment.profile?.username}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.profile?.avatar_url} />
                      <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                        {comment.profile?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <Link
                        to={`/profile/${comment.profile?.username}`}
                        className="font-semibold mr-2 hover:underline"
                      >
                        {comment.profile?.username}
                      </Link>
                      {comment.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {user?.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Comment input */}
        <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newComment.trim() || addComment.isPending}
              className="gradient-button text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
