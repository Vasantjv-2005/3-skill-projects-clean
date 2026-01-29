import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, X, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePost } from '@/hooks/usePosts';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from 'sonner';

export default function CreatePost() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const createPost = useCreatePost();
  const { upload, uploading } = useImageUpload('posts');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const clearImage = () => {
    setPreview(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrl = await upload(file);
      await createPost.mutateAsync({ imageUrl, caption });
      toast.success('Post created successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Create Post</h1>

      {/* Image upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {preview ? (
          <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={clearImage}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-4 bg-secondary/50"
          >
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <ImagePlus className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium">Choose a photo</p>
              <p className="text-sm text-muted-foreground">or drag and drop</p>
            </div>
          </button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </motion.div>

      {/* Caption */}
      <div className="space-y-2">
        <Textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="min-h-[100px] resize-none"
          maxLength={2200}
        />
        <p className="text-xs text-muted-foreground text-right">
          {caption.length}/2200
        </p>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!file || isSubmitting || uploading}
        className="w-full gradient-button text-primary-foreground"
      >
        {isSubmitting || uploading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            <span>Posting...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span>Share</span>
          </div>
        )}
      </Button>
    </div>
  );
}
