import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthCallback, isLoading, error } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      // Handle OAuth error
      console.error('OAuth error:', errorParam);
      return;
    }

    if (code) {
      handleAuthCallback(code)
        .then(() => {
          // Redirect to portal on success
          navigate('/portal');
        })
        .catch((error) => {
          console.error('Auth callback error:', error);
        });
    } else {
      // No code parameter, redirect to login
      navigate('/portal/login');
    }
  }, [searchParams, handleAuthCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Authentication Failed</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <button
              onClick={() => navigate('/portal/login')}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <CardTitle>Completing Authentication</CardTitle>
          <CardDescription>
            Please wait while we complete your login...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Exchanging authorization code for tokens...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
