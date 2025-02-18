"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchPatientId, Patient, updatePatientProfile } from '@/utils/patient';
import { getCurrentUser } from '@/utils/auth';
import defaultProfilePic from '@/public/default-profile.png';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const Profile = () => {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    date_of_birth: '',
    height: '',
    weight: '',
  });
  const [editedData, setEditedData] = useState({
    name: '',
    email: '',
    gender: '',
    date_of_birth: '',
    height: '',
    weight: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
      return;
    }

    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPatientId(currentUser.id);
        
        if (data?.patient?.user) {
          setPatient(data);
          const initialFormData = {
            name: data.patient.user.name || '',
            email: data.patient.user.email || '',
            gender: data.patient.gender || '',
            date_of_birth: data.patient.date_of_birth ? 
              new Date(data.patient.date_of_birth).toISOString().split('T')[0] : '',
            height: data.patient.height?.toString() || '',
            weight: data.patient.weight?.toString() || '',
          };
          setFormData(initialFormData);
          setEditedData(initialFormData);
          
          if (data.patient.user.photo_profile) {
            setPreviewUrl(data.patient.user.photo_profile);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient?.patient?.id) return;
  
    try {
      setSaveLoading(true);
      const submitFormData = new FormData();
      
      // Compare edited values with original values
      if (editedData.name !== formData.name) {
        submitFormData.append('name', editedData.name);
      }
      if (editedData.date_of_birth !== formData.date_of_birth) {
        submitFormData.append('date_of_birth', editedData.date_of_birth);
      }
      if (editedData.gender !== formData.gender) {
        submitFormData.append('gender', editedData.gender);
      }
      if (editedData.height && editedData.height !== formData.height) {
        const heightNum = parseFloat(editedData.height);
        if (!isNaN(heightNum)) {
          submitFormData.append('height', heightNum.toString());
        }
      }
      if (editedData.weight && editedData.weight !== formData.weight) {
        const weightNum = parseFloat(editedData.weight);
        if (!isNaN(weightNum)) {
          submitFormData.append('weight', weightNum.toString());
        }
      }
      
      if (selectedImage) {
        submitFormData.append('photo_profile', selectedImage);
      }
  
      await updatePatientProfile(patient.patient.id, submitFormData);
      
      // Refresh patient data
      const currentUser = getCurrentUser();
      if (currentUser) {
        const updatedData = await fetchPatientId(currentUser.id);
        if (updatedData?.patient) {
          setPatient(updatedData);
          const newFormData = {
            name: updatedData.patient.user.name || '',
            email: updatedData.patient.user.email || '',
            gender: updatedData.patient.gender || '',
            date_of_birth: updatedData.patient.date_of_birth ? 
              new Date(updatedData.patient.date_of_birth).toISOString().split('T')[0] : '',
            height: updatedData.patient.height?.toString() || '',
            weight: updatedData.patient.weight?.toString() || '',
          };
          setFormData(newFormData);
          setEditedData(newFormData);
          if (updatedData.patient.user.photo_profile) {
            setPreviewUrl(updatedData.patient.user.photo_profile);
          }
        }
      }
      setIsEditing(false);
      setSelectedImage(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload only JPG, JPEG or PNG files');
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleStartEditing = () => {
    console.log('Edit button clicked');
    setEditedData({...formData});
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleCancel = () => {
    setEditedData({...formData});
    setSelectedImage(null);
    setPreviewUrl(patient?.patient?.user?.photo_profile || '');
    setIsEditing(false);
    setError('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8">
            <div className="flex justify-center">
              <div className="relative w-32 h-32 group">
                <Image
                  src={previewUrl || defaultProfilePic}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover border-4 border-white shadow-lg"
                />
                {isEditing && (
                  <>
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-center h-full text-white text-sm">
                        Click to change
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center mt-4">
              {formData.name || 'Your Profile'}
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 py-3 bg-red-50 border-l-4 border-red-500">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={isEditing ? editedData.name : formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={isEditing ? editedData.gender : formData.gender}
                  onChange={(e) => setEditedData(prev => ({ ...prev, gender: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={isEditing ? editedData.date_of_birth : formData.date_of_birth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={isEditing ? editedData.height : formData.height}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="0"
                  max="300"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={isEditing ? editedData.weight : formData.weight}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="0"
                  max="500"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm disabled:bg-green-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saveLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saveLoading}
                    className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;