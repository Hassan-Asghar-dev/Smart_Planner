import { auth, googleProvider } from "./firebase.js";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator
} from "firebase/auth";

const googleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("User Signed In: ", result.user);
  } catch (error) {
    console.error("Google Sign-In Error:", error.message);
  }
};

export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if MFA is enabled
    const idTokenResult = await user.getIdTokenResult();
    if (idTokenResult.claims.mfaEnabled) {
      await handleMFA(user);
    } else {
      return user;
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function signupWithEmail(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}

async function handleMFA(user) {
  try {
    const resolver = await multiFactor(user).getSession();
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    
    const phoneNumber = prompt("Enter your phone number for MFA:");
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneNumber, resolver);
    
    const verificationCode = prompt("Enter the verification code sent to your phone:");
    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
    
    await multiFactor(user).enroll(multiFactorAssertion);
    alert("MFA setup successful!");
  } catch (error) {
    console.error("MFA setup error:", error);
    throw error;
  }
}

export async function logout() {
  await firebaseSignOut(auth);
}

export { auth, googleSignIn };
