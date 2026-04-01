import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { profileApi } from '@/api/profile.api';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils';
import { Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  title: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  bio: z.string().max(300, 'Bio must be at most 300 characters').optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, token } = useAuthStore();
  const qClient = useQueryClient();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        email: profile.email || user?.email || '',
        title: profile.title || '',
        location: profile.location || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      let photoUrl = profile?.profile_photo_url;
      
      if (photoFile) {
        const photoRes = await profileApi.uploadPhoto(photoFile);
        photoUrl = photoRes.profile_photo_url; 
      }

      const updatePayload = {
        name: data.name,
        email: data.email,
        title: data.title,
        location: data.location,
        bio: data.bio,
        profile_photo_url: photoUrl,
      };

      const updated = await profileApi.updateProfile(updatePayload as any);
      
      // Sync updated profile data (photo, name, email, bio) into the global auth store
      // so Profile page and Avatar in the nav reflect the change immediately
      updateUser({ 
        ...user, 
        name: updated.name || data.name, 
        email: updated.email || data.email,
        title: updated.title || data.title,
        location: updated.location || data.location,
        profile_photo_url: photoUrl || user?.profile_photo_url,
        bio: updated.bio || data.bio,
      } as any);
      
      qClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated!');
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const avatarSrc = photoPreview || profile?.profile_photo_url || '';

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <PageHeader title="Edit Profile" description="Update your professional profile information." />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="bg-surface border-border">
          <CardContent className="p-8 space-y-8">
            {/* Photo Upload */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 ring-2 ring-border">
                <AvatarImage src={getImageUrl(avatarSrc)} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-syne">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="photoInput" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface-2 text-sm font-medium hover:bg-surface-3 transition-colors">
                  <Upload className="w-4 h-4" /> Upload Photo
                </Label>
                <input id="photoInput" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                <p className="text-xs text-muted-foreground mt-2">JPEG, PNG up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-1 space-y-2">
                <Label>Full Name *</Label>
                <Input {...register('name')} className="h-11" />
                {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
              </div>
              <div className="sm:col-span-1 space-y-2">
                <Label>Email *</Label>
                <Input type="email" {...register('email')} className="h-11" />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>
              <div className="sm:col-span-1 space-y-2">
                <Label>Job Title</Label>
                <Input {...register('title')} placeholder="e.g. Software Engineer" className="h-11" />
                {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
              </div>
              <div className="sm:col-span-1 space-y-2">
                <Label>Location</Label>
                <Input {...register('location')} placeholder="e.g. San Francisco, CA" className="h-11" />
                {errors.location && <p className="text-destructive text-xs">{errors.location.message}</p>}
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Bio</Label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  placeholder="Brief professional summary..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                {errors.bio && <p className="text-destructive text-xs">{errors.bio.message}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => navigate('/profile')}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditProfile;
