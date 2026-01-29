import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, Grid, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfileByUsername, useProfile } from '@/hooks/useProfile';
import { useUserPosts } from '@/hooks/usePosts';
import { useFollowCounts, useFollowStatus, useFollow, useUnfollow } from '@/hooks/useFollows';
import { useAuth } from '@/contexts/AuthContext';
import EditProfileDialog from '@/components/EditProfileDialog';
import PostGridItem from '@/components/PostGridItem';
import FollowersDialog from '@/components/FollowersDialog';
import { toast } from 'sonner';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFollowers, setShowFollowers] = useState<'followers' | 'following' | null>(null);

  const { data: currentUserProfile } = useProfile();
  const { data: profile, isLoading: profileLoading } = useProfileByUsername(username || '');
  const { data: posts = [], isLoading: postsLoading } = useUserPosts(profile?.user_id || '');
  const { data: followCounts } = useFollowCounts(profile?.user_id || '');
  const { data: isFollowing } = useFollowStatus(profile?.user_id || '');
  
  const follow = useFollow();
  const unfollow = useUnfollow();

  const isOwnProfile = user?.id === profile?.user_id;

  const handleFollowToggle = async () => {
    if (!profile) return;
    
    try {
      if (isFollowing) {
        await unfollow.mutateAsync(profile.user_id);
        toast.success('Unfollowed');
      } else {
        await follow.mutateAsync(profile.user_id);
        toast.success('Following');
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
          <Skeleton className="w-24 h-24 md:w-36 md:h-36 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center py-16">
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <p className="text-muted-foreground">This user doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8 items-start mb-8"
        >
          {/* Avatar */}
          <Avatar className="w-24 h-24 md:w-36 md:h-36">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="gradient-primary text-primary-foreground text-3xl">
              {profile.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h1 className="text-xl font-semibold">{profile.username}</h1>
              
              {isOwnProfile ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEditProfile(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant={isFollowing ? 'secondary' : 'default'}
                  size="sm"
                  onClick={handleFollowToggle}
                  disabled={follow.isPending || unfollow.isPending}
                  className={!isFollowing ? 'gradient-button text-primary-foreground' : ''}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div>
                <span className="font-semibold">{posts.length}</span>
                <span className="text-muted-foreground ml-1">posts</span>
              </div>
              <button
                onClick={() => setShowFollowers('followers')}
                className="hover:opacity-80 transition-opacity"
              >
                <span className="font-semibold">{followCounts?.followers || 0}</span>
                <span className="text-muted-foreground ml-1">followers</span>
              </button>
              <button
                onClick={() => setShowFollowers('following')}
                className="hover:opacity-80 transition-opacity"
              >
                <span className="font-semibold">{followCounts?.following || 0}</span>
                <span className="text-muted-foreground ml-1">following</span>
              </button>
            </div>

            {/* Bio */}
            <div>
              <p className="font-semibold">{profile.name}</p>
              {profile.bio && <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>}
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-border mb-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 py-3 px-4 border-t-2 border-foreground -mt-[1px]">
              <Grid className="w-4 h-4" />
              <span className="text-sm font-medium">Posts</span>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {postsLoading ? (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full border-2 border-foreground flex items-center justify-center mx-auto mb-4">
              <Camera className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {isOwnProfile ? 'Share Photos' : 'No Posts Yet'}
            </h2>
            <p className="text-muted-foreground">
              {isOwnProfile
                ? 'When you share photos, they will appear on your profile.'
                : 'This user hasn\'t shared any photos yet.'}
            </p>
            {isOwnProfile && (
              <Button asChild className="mt-4 gradient-button text-primary-foreground">
                <Link to="/create">Create your first post</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {posts.map((post) => (
              <PostGridItem key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <EditProfileDialog
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        profile={profile}
      />

      <FollowersDialog
        userId={profile.user_id}
        type={showFollowers}
        onClose={() => setShowFollowers(null)}
      />
    </>
  );
}
