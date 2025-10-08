import React from 'react';
import { Button } from '@/components/ui/button';
import { Google, Facebook } from 'lucide-react';

const AuthSocialButtons: React.FC<{ onGoogleClick: () => void; onFacebookClick: () => void; }> = ({ onGoogleClick, onFacebookClick }) => {
  return (
    <div className="flex flex-col space-y-4">
      <Button onClick={onGoogleClick} className="flex items-center justify-center w-full bg-red-500 text-white">
        <Google className="mr-2" />
        Sign in with Google
      </Button>
      <Button onClick={onFacebookClick} className="flex items-center justify-center w-full bg-blue-600 text-white">
        <Facebook className="mr-2" />
        Sign in with Facebook
      </Button>
    </div>
  );
};

export default AuthSocialButtons;