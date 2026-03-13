import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageCropper from '@/components/ImageCropper';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, refetchProfile } = useAuthContext();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const getInitials = (name: string | null | undefined) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 5MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user) return;

    setIsUploadingAvatar(true);
    try {
      const fileName = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add timestamp to bust cache
      const urlWithCache = `${publicUrl}?t=${Date.now()}`;
      
      const { error: updateError } = await updateProfile({ avatar_url: urlWithCache });
      if (updateError) throw updateError;

      refetchProfile();
      toast({ title: 'Avatar updated', description: 'Your profile picture has been updated' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message || 'Failed to upload avatar', variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const formatPhoneNumber = (value: string): string => {
    return value.replace(/\D/g, '').slice(-10);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updates: { display_name?: string; phone_number?: string } = {};
      if (displayName !== profile?.display_name) updates.display_name = displayName;
      if (phoneNumber !== profile?.phone_number) updates.phone_number = phoneNumber || null;

      if (Object.keys(updates).length === 0) {
        toast({ title: 'No changes', description: 'No changes to save' });
        setIsLoading(false);
        return;
      }

      const { error } = await updateProfile(updates);
      if (error) throw error;

      refetchProfile();
      toast({ title: 'Profile updated', description: 'Your profile has been saved' });
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message || 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Profile</h1>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-md mx-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-28 w-28 border-4 border-primary/20">
              <AvatarImage src={profile?.avatar_url || ''} alt={displayName || 'User'} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials(displayName || profile?.display_name)}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 h-10 w-10 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-primary-foreground" />
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="displayName" placeholder="Enter your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-10 h-12" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center w-16 h-12 bg-muted rounded-lg border border-border text-foreground font-medium text-sm">+91</div>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phoneNumber" type="tel" placeholder="Enter 10-digit number" value={phoneNumber} onChange={handlePhoneChange} className="pl-10 h-12" maxLength={10} />
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full h-12">
          {isLoading ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>) : 'Save Changes'}
        </Button>
      </div>

      <ImageCropper open={cropperOpen} onOpenChange={setCropperOpen} imageSrc={selectedImage} onCropComplete={handleCropComplete} />
    </div>
  );
};

export default ProfilePage;
