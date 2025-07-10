import React, { useState, useEffect } from "react";
import { signOut, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../firebase/firebase';
import { FaCamera, FaChalkboardTeacher, FaArrowLeft } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useNavigate } from 'react-router-dom';

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const Profile = () => {
    const [user, setUser] = useState(null);
    const [originalProfileData, setOriginalProfileData] = useState(null);
    const [profileData, setProfileData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        dob: "",
        qualification: "",
        address: "",
        bio: "",
        role: "teacher",
        subjects: [],
        profile_image: "",
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [loginTime, setLoginTime] = useState(null);
    const [logoutTime, setLogoutTime] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = auth.currentUser;
        setUser(currentUser);
        if (currentUser) {
            // First set default data
            const initialData = {
                first_name: "",
                last_name: "",
                email: currentUser.email,
                phone_number: "",
                dob: "",
                qualification: "",
                address: "",
                bio: "",
                role: "teacher",
                subjects: [],
                profile_image: "",
            };
            setProfileData(initialData);
            setOriginalProfileData(initialData);
            setLoginTime(new Date());

            // Then fetch profile data from backend
            fetch(`/api/get-profile/${currentUser.uid}/`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' && data.profile) {
                        setProfileData(data.profile);
                        setOriginalProfileData(data.profile);
                    }
                })
                .catch(error => {
                    console.error("Error fetching profile:", error);
                });
        } else {
            setLoginTime(null);
            setLogoutTime(new Date());
        }
    }, []);

    useEffect(() => {
        let intervalId;
        if (user) {
            const startTime = Date.now();
            intervalId = setInterval(() => {
                const currentTime = Date.now();
                const elapsedMilliseconds = currentTime - startTime;
                setTimeElapsed(Math.floor(elapsedMilliseconds / 1000));
            }, 1000);
        } else {
            clearInterval(intervalId); // Clear interval if user logs out
            setTimeElapsed(0); // Reset timer
        }
        return () => clearInterval(intervalId);
    }, [user]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const formatDateTime = (date) => {
        if (!date) return "";
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return date.toLocaleDateString(undefined, options);
    };

    const goBack = () => {
        navigate(-1);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData((prev) => ({ ...prev, profile_image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancel = () => {
        setProfileData(originalProfileData);
        setIsEditing(false);
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const userId = auth.currentUser?.uid;
    
            if (!userId) {
                alert("User not logged in!");
                setIsSaving(false);
                return;
            }
    
            // Prepare the data
            const formData = new FormData();
            Object.keys(profileData).forEach(key => {
                if (profileData[key] !== null && profileData[key] !== undefined) {
                    formData.append(key, profileData[key]);
                }
            });
            formData.append('uid', userId);

            const response = await fetch('/api/save-profile/', {
                method: "POST",
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: formData,
                credentials: 'include'
            });
    
            const result = await response.json();
    
            if (response.ok) {
                alert("Profile saved successfully!");
                setOriginalProfileData(profileData);
                setIsEditing(false);
            } else {
                alert("Failed to save profile. " + result.message);
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Something went wrong while saving profile.");
        } finally {
            setIsSaving(false);
        }
    };
    const handleDeleteProfile = async () => {
        if (!auth.currentUser) {
            alert("No user is currently logged in.");
            return;
        }

        if (window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
            try {
                const provider = new GoogleAuthProvider();
                await reauthenticateWithPopup(auth.currentUser, provider);
                await deleteUser(auth.currentUser);
                alert("Profile deleted successfully.");
                navigate('/'); // Redirect to homepage after deletion
            } catch (error) {
                console.error("Error deleting profile:", error);
                alert("Failed to delete profile. Please re-authenticate and try again.");
            }
        }
    };
    const handleShareProfile = () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert("No user found.");
            return;
        }

        const profileLink = `${window.location.origin}/profile/${currentUser.uid}`;
        navigator.clipboard.writeText(profileLink)
            .then(() => {
                setCopySuccess(true);
                alert("Profile link copied to clipboard!");
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
                alert("Failed to copy profile link.");
            });
    };


    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Navbar */}
            <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
                <button onClick={goBack} className="focus:outline-none">
                    <FaArrowLeft className="text-indigo-600 text-2xl" />
                </button>
                <div className="flex items-center">
                    <FaChalkboardTeacher className="text-indigo-600 text-3xl" />
                    <span className="ml-2 text-indigo-600 text-xl font-semibold">
                        Smart Teaching Planner
                    </span>
                </div>
                <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center">
                        <img className="h-8 w-8 rounded-full" src={profileData.profileImage || "https://ui-avatars.com/api/?name=User&background=random"} alt="Profile" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2">
                            <button className="block px-4 py-2 text-sm text-gray-700">Your Profile</button>
                            <button className="block px-4 py-2 text-sm text-gray-700">Settings</button>
                            <button
                                onClick={async () => {
                                    try {
                                        await signOut(auth);
                                        alert("Signed out successfully!");
                                        window.location.href = "/";
                                    } catch (error) {
                                        console.error("Error signing out:", error);
                                        alert("Failed to sign out. Please try again.");
                                    } finally {
                                        setLogoutTime(new Date()); // Record logout time on sign out
                                        setUser(null); // Update user state
                                    }
                                }}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-6 sm:px-12 lg:px-16 relative">
                <h1 className="text-3xl font-extrabold text-indigo-600 mb-8">Profile Settings</h1>
                <div className="bg-white shadow-lg p-10 rounded-xl mt-12 relative flex flex-col items-center">
                    {/* Profile Picture Upload & Share Button */}
                    <div className="flex flex-col items-center absolute -top-20 left-1/2 transform -translate-x-1/2">
                        <label htmlFor="imageUpload" className={`relative cursor-pointer ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {profileData.profile_image ? (
                                <img className="h-28 w-28 rounded-full border-4 border-indigo-300 shadow-md" src={profileData.profile_image} alt="Profile" />
                            ) : (
                                <div className="h-28 w-28 flex items-center justify-center rounded-full border-4 border-indigo-300 bg-indigo-100 shadow-md">
                                    <FaCamera className="text-indigo-400 text-4xl" />
                                </div>
                            )}
                            <input
                                id="imageUpload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={!isEditing}
                                className="hidden"
                            />
                        </label>
                        <button onClick={handleShareProfile} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300">
                            Share Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-16">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm text-indigo-500 font-medium">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={profileData.first_name}
                                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                disabled={!isEditing}
                                className={`w-full mt-1 p-2 border rounded-md ${!isEditing ? "bg-gray-100 text-gray-600" : ""}`}
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm text-indigo-500 font-medium">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                disabled={!isEditing}
                                className={`w-full mt-1 p-2 border rounded-md ${!isEditing ? "bg-gray-100 text-gray-600" : ""}`}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-indigo-500 font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                disabled
                                className="w-full mt-1 p-2 border rounded-md bg-gray-100"
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm text-indigo-500 font-medium">Role</label>
                            <input
                                type="text"
                                name="role"
                                value={profileData.role}
                                disabled
                                className="w-full mt-1 p-2 border rounded-md bg-gray-100 text-gray-600"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm text-indigo-500 font-medium">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                value={profileData.dob}
                                onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                                disabled={!isEditing}
                                className={`w-full mt-1 p-2 border rounded-md ${!isEditing ? "bg-gray-100 text-gray-600" : ""}`}
                            />
                        </div>

                        {/* Qualification */}
                        <div>
                            <label className="block text-sm text-indigo-500 font-medium">Qualification</label>
                            <select
                                name="qualification"
                                value={profileData.qualification}
                                onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                                disabled={!isEditing}
                                className={`w-full mt-1 p-2 border rounded-md bg-white text-indigo-500 ${!isEditing ? "bg-gray-100 text-gray-600" : ""}`}
                            >
                                <option value="">Select Qualification</option>
                                <option value="masters">Master's</option>
                                <option value="bsc">BSc</option>
                                <option value="phd">PhD</option>
                                <option value="ics">ICS</option>
                                <option value="fsc_pre_eng">FSc (Pre-Engineering)</option>
                                <option value="fsc_pre_med">FSc (Pre-Medical)</option>
                            </select>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm text-indigo-500 font-medium">Phone Number</label>
                            <PhoneInput
                                country={"us"}
                                value={profileData.phone_number}
                                onChange={(phone) => setProfileData({ ...profileData, phone_number: phone })}
                                disabled={!isEditing}
                                inputClass={`w-full mt-1 p-2 border rounded-md ${!isEditing ? "bg-gray-100 text-gray-600" : ""}`}
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm text-indigo-500 font-medium">Bio</label>
                            <textarea
                                name="bio"
                                value={profileData.bio}
                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                disabled={!isEditing}
                                className={`w-full mt-1 p-2 border rounded-md h-24 ${!isEditing ? "bg-gray-100 text-gray-600" : ""}`}
                                placeholder="Write a short bio about yourself..."
                            />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                    <div>
                        <button
                            onClick={handleDeleteProfile}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Delete Profile
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            {isEditing ? "View Profile" : "Edit Profile"}
                        </button>
                    </div>
                    <div>
                        <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Cancel</button>
                        <button onClick={handleSave} className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Login/Logout Time and Live Login Time Display */}
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-700 bg-opacity-80 p-3 rounded-md shadow-md text-sm text-white flex flex-col items-center">
                    {loginTime && <p>Login Time: {formatDateTime(loginTime)}</p>}
                    {logoutTime && <p>Last Logout Time: {formatDateTime(logoutTime)}</p>}
                    {user && <p>Time on Page: {formatTime(timeElapsed)}</p>}
                </div>
            </main>
        </div>
    );
};

export default Profile;