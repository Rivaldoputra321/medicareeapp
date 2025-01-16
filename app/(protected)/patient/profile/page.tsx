"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchPatientId, Patient, updatePatientProfile } from '@/utils/patient';
import { getCurrentUser } from '@/utils/auth';
import defaultProfilePic from '@/public/default-profile.png';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telp: '',
    gender: '',
    date_of_birth: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
      return;
    }

    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        const patientData = await fetchPatientId(currentUser.id);
        setPatient(patientData);
        setFormData({
          name: patientData.user.name || '',
          email: patientData.user.email || '',
          telp: patientData.telp || '',
          gender: patientData.gender || '',
          date_of_birth: patientData.date_of_birth ? new Date(patientData.date_of_birth).toISOString().split('T')[0] : '',
        });
        setPreviewUrl(patientData.user.photo_profile || '');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile data';
        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient?.id) return;

    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('date_of_birth', formData.date_of_birth);
      submitFormData.append('gender', formData.gender);
      
      if (selectedImage) {
        submitFormData.append('photo_profile', selectedImage);
      }

      await updatePatientProfile(patient.id, submitFormData);
      setIsEditing(false);

      // Refresh patient data
      const updatedPatient = await fetchPatientId(patient.id);
      setPatient(updatedPatient);
      setFormData({
        name: updatedPatient.user.name || '',
        email: updatedPatient.user.email || '',
        telp: updatedPatient.telp || '',
        gender: updatedPatient.gender || '',
        date_of_birth: updatedPatient.date_of_birth ? new Date(updatedPatient.date_of_birth).toISOString().split('T')[0] : '',
      });
      setPreviewUrl(updatedPatient.user.photo_profile || '');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-24">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 mt-24">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <Image
                src={previewUrl || defaultProfilePic}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
              {isEditing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="telp"
                value={formData.telp}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <input
                type="text"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;