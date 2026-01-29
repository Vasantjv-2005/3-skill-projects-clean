import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearchProfiles } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';

export default function Search() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { data: results = [], isLoading } = useSearchProfiles(query);

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : query.trim() === '' ? (
          <div className="text-center py-8 text-muted-foreground">
            Search for users by name or username
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found for "{query}"
          </div>
        ) : (
          results.map((profile) => (
            <motion.button
              key={profile.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(`/profile/${profile.username}`)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="gradient-primary text-primary-foreground">
                  {profile.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium truncate">{profile.username}</p>
                <p className="text-sm text-muted-foreground truncate">{profile.name}</p>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
