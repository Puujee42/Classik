'use client';

import { SWRConfig } from 'swr';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { VibeProvider } from '@/context/VibeContext';

const swrDefaults = {
  revalidateOnFocus: false,
  dedupingInterval: 120000,
  errorRetryCount: 2,
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrDefaults}>
      <LanguageProvider>
        <AuthProvider>
          <VibeProvider>
            <ErrorBoundary>
              <div className="flex-1 w-full min-h-screen">
                {children}
              </div>
              <Toaster position="bottom-right" />
            </ErrorBoundary>
          </VibeProvider>
        </AuthProvider>
      </LanguageProvider>
    </SWRConfig>
  );
}
