import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase/firebase";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    PhoneAuthProvider,
    RecaptchaVerifier,
    sendEmailVerification,
    getMultiFactorResolver,
    PhoneMultiFactorGenerator,
    setPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail,
} from "firebase/auth";

import { FaChalkboardTeacher } from "react-icons/fa";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [mfaVisible, setMfaVisible] = useState(false);
    const [mfaCode, setMfaCode] = useState("");
    const [resolver, setResolver] = useState(null);
    const [verificationId, setVerificationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const emailInputRef = useRef(null);

    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: (response) => {
                    console.log("reCAPTCHA solved:", response);
                },
                "expired-callback": () => {
                    console.log("reCAPTCHA expired. Resetting...");
                    window.recaptchaVerifier.clear();
                    delete window.recaptchaVerifier;
                },
            });
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await setPersistence(auth, browserSessionPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                await sendEmailVerification(user);
                console.log("Verification email sent to:", user.email);
                setError("A verification email has been sent. Please check your inbox.");
                setLoading(false);
                return;
            }

            navigate("/dashboard");
        } catch (error) {
            setLoading(false);
            if (error.code === "auth/multi-factor-auth-required") {
                const mfaResolver = getMultiFactorResolver(auth, error);
                setResolver(mfaResolver);

                const phoneInfo = mfaResolver.hints.find((factor) => factor.factorId === PhoneMultiFactorGenerator.FACTOR_ID);
                if (!phoneInfo || !phoneInfo.uid) {
                    setError("No valid phone number found for MFA.");
                    return;
                }

                let phoneNumber = phoneInfo.uid.trim().replace(/\s+/g, "");

                if (!phoneNumber.startsWith("+") || !/^\+\d{10,15}$/.test(phoneNumber)) {
                    console.log("Formatted Phone Number:", phoneNumber);
                    setError("Invalid phone number format. Ensure it includes country code and is 10-15 digits long.");
                    return;
                }

                const phoneAuthProvider = new PhoneAuthProvider(auth);
                const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneNumber, window.recaptchaVerifier);

                setVerificationId(verificationId);
                setMfaVisible(true);
            } else {
                setError(error.message);
            }
        }
    };

    const verifyMfaCode = async () => {
        try {
            if (!resolver || !verificationId) {
                setError("MFA verification failed. Please try logging in again.");
                return;
            }

            const credential = PhoneAuthProvider.credential(verificationId, mfaCode);
            const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);

            const finalUserCredential = await resolver.resolveSignIn(multiFactorAssertion);

            navigate("/dashboard");
        } catch (error) {
            setError("Invalid verification code. Please try again.");
        }
    };

    const handleResendVerificationEmail = async () => {
        try {
            if (!auth.currentUser) {
                setError("No user found. Please log in first.");
                return;
            }
            await sendEmailVerification(auth.currentUser);
            setError("Verification email resent. Check your inbox.");
        } catch (error) {
            setError("Failed to resend verification email. Try again later.");
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            await setPersistence(auth, browserSessionPersistence);
            const result = await signInWithPopup(auth, googleProvider);
            console.log("Google Sign-In Success:", result.user);
            navigate("/dashboard");
        } catch (error) {
            setError("Google Sign-In failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email address.");
            if (emailInputRef.current) {
                emailInputRef.current.focus();
            }
            return;
        }
        setError("");
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setResetMessage("Password reset email sent. Check your inbox.");
        } catch (error) {
            console.error("Password reset error:", error);
            setError("Failed to send reset email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 via-white to-indigo-100 font-sans">
                <div className="max-w-md w-full space-y-6 bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-center">
                        <FaChalkboardTeacher className="text-indigo-600 text-6xl" />
                    </div>

                    <h2 className="text-center text-3xl font-extrabold text-gray-500">Sign in to your account</h2>
                    <p className="text-center text-sm text-gray-600">
                        Or <Link to="/signup" className="text-indigo-600">create a new account</Link>
                    </p>

                    {resetMessage && (
                        <div className="text-center">
                            <p className="text-green-500 text-sm font-semibold">{resetMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center">
                            <p className="text-red-500 text-sm font-semibold">{error}</p>
                            {error === "A verification email has been sent. Please check your inbox." && (
                                <button
                                    onClick={handleResendVerificationEmail}
                                    className="text-blue-600 text-sm mt-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                                >
                                    Resend Verification Email
                                </button>
                            )}
                        </div>
                    )}

                    {!mfaVisible ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                ref={emailInputRef}
                                aria-label="Email address"
                            />

                            <div className="relative">
                                <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                required
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-400 pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-label="Password"
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

                            <p className="text-left text-sm text-indigo-600 cursor-pointer" onClick={handleForgotPassword}>
                                Forgot Password?
                            </p>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>

                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="mx-4 text-gray-400 font-semibold">OR</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>
                        </form>

                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-600">Enter the verification code sent to your phone.</p>
                            <input
                                type="text"
                                placeholder="MFA Code"
                                required
                                className="w-full p-3 border rounded-md"
                                value={mfaCode}
                                onChange={(e) => setMfaCode(e.target.value)}
                                aria-label="Multi-factor authentication code"
                            />
                            <button
                                onClick={verifyMfaCode}
                                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
                            >
                                Verify
                            </button>
                        </div>
                    )}

                    <div className="flex justify-center mt-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center space-x-3 w-full max-w-xs py-2 px-4 rounded-md bg-white border shadow-md hover:bg-gray-100 transition disabled:opacity-50"
                            disabled={loading}
                        >
                            <img src="/google_logo.svg.png" alt="Google Logo" className="w-6 h-6" />
                            <span className="text-gray-700 font-medium">Sign in with Google</span>
                        </button>
                    </div>

                    <div id="recaptcha-container"></div>
                </div>
            </div>
        </>
    );
};

export default Login;
