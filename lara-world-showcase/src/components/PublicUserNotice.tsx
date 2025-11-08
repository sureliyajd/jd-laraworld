import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock, Mail, Heart, Rocket, Star, Send } from 'lucide-react';
import { CONTACT_CONFIG } from '@/config/contact';

interface PublicUserNoticeProps {
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

/**
 * Fun and sassy notice component for public demo users
 * Informs them they're using demo credentials and can only view content
 */
export const PublicUserNotice: React.FC<PublicUserNoticeProps> = ({ 
  variant = 'default',
  className = '' 
}) => {
  const messages = [
    {
      emoji: '👋',
      text: "Hey there, explorer!",
    },
    {
      emoji: '🎭',
      text: "You're currently browsing with demo credentials - that's why you're in 'view-only' mode!",
    },
    {
      emoji: '🔒',
      text: "Actions like creating, editing, or deleting are locked for demo accounts (safety first, you know! 🛡️).",
    },
    {
      emoji: '✨',
      text: "But wait - there's more! Want to explore all the awesome features?",
    },
    {
      emoji: '💌',
      text: "Just drop me a message and I'll hook you up with visitor credentials so you can experience the full power of this Laravel showcase! 🚀",
    },
  ];

  const compactMessage = "🔒 Demo Mode Active: You're viewing with public credentials. Want full access?";
  const emailSubject = encodeURIComponent('Visitor Credentials Request - LaraWorld Portal');
  const emailBody = encodeURIComponent(`Hi ${CONTACT_CONFIG.name},\n\nI'm interested in exploring the full features of your Laravel showcase portal. Could you please provide me with visitor credentials?\n\nThank you!`);
  const mailtoLink = `mailto:${CONTACT_CONFIG.email}?subject=${emailSubject}&body=${emailBody}`;

  if (variant === 'compact') {
    return (
      <Alert className={`bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 ${className}`}>
        <div className="flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <AlertDescription className="text-sm font-medium text-gray-800">
              {compactMessage}
            </AlertDescription>
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <a href={mailtoLink} className="inline-flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>Request Visitor Access</span>
                <Rocket className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 ${className}`}>
        <Lock className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-gray-800">
          Demo Mode: View-only access.
        </span>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-6 text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          <a href={mailtoLink} className="inline-flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Request Access
          </a>
        </Button>
      </div>
    );
  }

  return (
    <Alert className={`bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 shadow-lg ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="relative">
            <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
            <Star className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <AlertDescription className="text-base font-semibold text-gray-900 leading-relaxed">
            {messages.map((msg, index) => (
              <React.Fragment key={index}>
                <span className="inline-block mr-2 text-xl">{msg.emoji}</span>
                <span>{msg.text}</span>
                {index < messages.length - 1 && <br />}
              </React.Fragment>
            ))}
          </AlertDescription>
          <div className="pt-3 border-t border-purple-200 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-700 font-medium">
                Ready to unlock the full experience? 
                <span className="inline-flex items-center gap-1 ml-1 text-purple-700">
                  Let's connect! <Heart className="h-3 w-3 text-red-500 animate-pulse" />
                </span>
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all flex-1"
              >
                <a href={mailtoLink} className="inline-flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>Request Visitor Credentials</span>
                  <Rocket className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <a href={`mailto:${CONTACT_CONFIG.email}`} className="inline-flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">{CONTACT_CONFIG.email}</span>
                  <span className="sm:hidden">Email Me</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Rocket className="h-6 w-6 text-blue-600 opacity-70" />
        </div>
      </div>
    </Alert>
  );
};

