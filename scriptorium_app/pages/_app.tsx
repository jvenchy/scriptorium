import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from '@/contexts/AuthContext';
import { SearchProvider } from '@/contexts/SearchContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SearchProvider>
        <Component {...pageProps} />
      </SearchProvider>
    </AuthProvider>
  );
}
