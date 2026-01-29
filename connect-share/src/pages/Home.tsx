import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFeedPosts } from '@/hooks/usePosts';
import PostCard from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedPosts();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold hidden lg:block">Home</h1>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="aspect-square" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : allPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <ImageOff className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your feed is empty</h2>
          <p className="text-muted-foreground mb-4">
            Start following people to see their posts here, or create your first post!
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/explore">Explore</Link>
            </Button>
            <Button asChild className="gradient-button text-primary-foreground">
              <Link to="/create">Create Post</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={ref} className="py-4">
            {isFetchingNextPage && (
              <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
