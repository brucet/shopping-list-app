import React from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, User } from 'firebase/auth';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome to Shopping List</h2>
      <p>Please sign in to continue</p>
      <button onClick={handleLogin} className="login-btn">
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
