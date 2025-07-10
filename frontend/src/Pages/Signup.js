import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/auth";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FaChalkboardTeacher, FaUserPlus } from "react-icons/fa";

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        retypePassword: "",
        role: "",
        subjects: [],
        enableMfa: false,
    });
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);

    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);

        if (!minLength) {
            setPasswordStrength("Password must be at least 8 characters long.");
        } else if (!hasNumber) {
            setPasswordStrength("Include at least one number (0-9).");
        } else if (!hasSpecialChar) {
            setPasswordStrength("Include at least one special character (!@#$%^&*).");
        } else if (!hasUppercase) {
            setPasswordStrength("Include at least one uppercase letter (A-Z).");
        } else {
            setPasswordStrength("");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox" && name === "enableMfa") {
            setFormData((prevData) => ({ ...prevData, enableMfa: checked }));
        } else if (type === "select-multiple") {
            const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
            setFormData((prevData) => ({ ...prevData, subjects: selectedOptions }));
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }

        if (name === "password" || name === "retypePassword") {
            setPasswordError(
                name === "password" && formData.retypePassword && value !== formData.retypePassword
                    ? "Passwords do not match!"
                    : name === "retypePassword" && value !== formData.password
                        ? "Passwords do not match!"
                        : ""
            );
        }

        if (name === "password") {
            validatePassword(value);
        }
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user already exists
            const methods = await fetchSignInMethodsForEmail(auth, user.email);
            if (methods.length > 0) {
                alert("An account with this email already exists. Please log in.");
                navigate("/login");
                setLoading(false);
                return;
            }

            console.log("Google Sign-Up Success:", user);
            alert(`Signed up with Google as ${user.email}`);

            navigate("/login");
        } catch (error) {
            console.error("Google sign-in error:", error);
            setError(error.message);
        }

        setLoading(false);
    };

const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.retypePassword) {
            setPasswordError("Passwords do not match!");
            return;
        }

        if (passwordStrength) {
            return;
        }

        try {
            const methods = await fetchSignInMethodsForEmail(auth, formData.email);
            if (methods.length > 0) {
                setError("An account with this email already exists. Please log in.");
                return;
            }

            await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            alert("Account created successfully!");
            navigate("/login");
        } catch (error) {
            setError(error.message);
        }
    };


    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-teal-100 via-white to-teal-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-lg">
                    <div className="text-center">
                        <FaChalkboardTeacher className="text-indigo-600 text-5xl mx-auto" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-700">Create your account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Or{" "}
                            <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer" onClick={() => navigate("/login")}>
                                sign in to your existing account
                            </span>
                        </p>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400"
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400"
                                onChange={handleChange}
                            />
                        </div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            required
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400"
                            onChange={handleChange}
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400 pr-10"
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-600"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15a5 5 0 110-10 5 5 0 010 10z" />
                                        <path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {passwordStrength && <p className="text-red-500 text-sm">{passwordStrength}</p>}
                        <div className="relative">
                            <input
                                type={showRetypePassword ? "text" : "password"}
                                name="retypePassword"
                                placeholder="Retype Password"
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400 pr-10"
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowRetypePassword(!showRetypePassword)}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-600"
                                aria-label={showRetypePassword ? "Hide password" : "Show password"}
                            >
                                {showRetypePassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15a5 5 0 110-10 5 5 0 010 10z" />
                                        <path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

                        <select
                            name="role"
                            required
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400"
                            onChange={handleChange}
                        >
                            <option value="">Choose a role</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Administrator</option>
                            <option value="guest">Guest</option>
                        </select>
                        <select
                            name="subjects"
                            multiple
                            required
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-600"
                            onChange={handleChange}
                        >
                            <option value="mathematics">Mathematics</option>
                            <option value="science">Science</option>
                            <option value="english">English</option>
                            <option value="history">History</option>
                            <option value="geography">Geography</option>
                        </select>
                        <div className="flex items-center">
                            <input type="checkbox" name="enableMfa" className="mr-2" onChange={handleChange} />
                            <label>Enable Two-Factor Authentication</label>
                        </div>
                        <div>
                            <button
                                type="submit"
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50"
                            disabled={!!passwordError || !!passwordStrength}
                            >
                                <FaUserPlus className="mr-2" /> Create Account
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-gray-400 font-semibold">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleGoogleSignUp}
                            className="flex items-center justify-center space-x-3 w-full max-w-xs py-2 px-4 rounded-md bg-white border shadow-md hover:bg-gray-100 transition disabled:opacity-50"
                            disabled={loading}
                        >
                            <img src="/google_logo.svg.png" alt="Google Logo" className="w-6 h-6" />
                            <span className="text-indigo-700 font-medium">Sign up with Google</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignUp;
