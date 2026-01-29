import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFollowers, useFollowing } from '@/hooks/useFollows';
import { Skeleton } from '@/components/ui/skeleton';

interface FollowersDialogProps {
  userId: string;
  type: 'followers' | 'following' | null;
  onClose: () => void;
}

export default function FollowersDialog({ userId, type, onClose }: FollowersDialogProps) {
  const { data: followers = [], isLoading: followersLoading } = useFollowers(userId);
  const { data: following = [], isLoading: followingLoading } = useFollowing(userId);

  const isOpen = type !== null;
  const data = type === 'followers' ? followers : following;
  const isLoading = type === 'followers' ? followersLoading : followingLoading;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="capitalize">{type}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {data.map((profile: any) => (
                <Link
                  key={profile.id}
                  to={`/profile/${profile.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="gradient-primary text-primary-foreground">
                      {profile.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{profile.username}</p>
                    <p className="text-sm text-muted-foreground truncate">{profile.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
