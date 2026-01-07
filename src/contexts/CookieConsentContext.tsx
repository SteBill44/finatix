import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ConsentStatus = "accepted" | "declined" | "pending";

export interface ConsentPreferences {
  essential: boolean; // Always true - required for the site to function
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

interface CookieConsentContextType {
  consentStatus: ConsentStatus;
  preferences: ConsentPreferences;
  hasConsented: boolean;
  acceptAll: () => void;
  declineAll: () => void;
  updatePreferences: (preferences: Partial<ConsentPreferences>) => void;
  resetConsent: () => void;
  canSetCookie: (type: keyof ConsentPreferences) => boolean;
}

const COOKIE_CONSENT_KEY = "cookie-consent-status";
const COOKIE_PREFERENCES_KEY = "cookie-preferences";

const defaultPreferences: ConsentPreferences = {
  essential: true,
  analytics: false,
  functional: false,
  marketing: false,
};

const acceptedPreferences: ConsentPreferences = {
  essential: true,
  analytics: true,
  functional: true,
  marketing: true,
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
};

interface CookieConsentProviderProps {
  children: ReactNode;
}

export const CookieConsentProvider = ({ children }: CookieConsentProviderProps) => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>("pending");
  const [preferences, setPreferences] = useState<ConsentPreferences>(defaultPreferences);

  // Load saved consent on mount
  useEffect(() => {
    const savedStatus = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentStatus | null;
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (savedStatus && (savedStatus === "accepted" || savedStatus === "declined")) {
      setConsentStatus(savedStatus);
      
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences) as ConsentPreferences;
          setPreferences({ ...parsed, essential: true }); // Essential always true
        } catch {
          // If parsing fails, use defaults based on status
          setPreferences(savedStatus === "accepted" ? acceptedPreferences : defaultPreferences);
        }
      } else {
        setPreferences(savedStatus === "accepted" ? acceptedPreferences : defaultPreferences);
      }
    }
  }, []);

  // Clear non-essential cookies when declined
  useEffect(() => {
    if (consentStatus === "declined") {
      clearNonEssentialCookies();
    }
  }, [consentStatus]);

  const clearNonEssentialCookies = () => {
    // Get all cookies and remove non-essential ones
    const cookies = document.cookie.split(";");
    
    // List of essential cookies that should NOT be deleted
    const essentialCookies = ["cookie-consent-status", "cookie-preferences", "sb-"];
    
    cookies.forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      const isEssential = essentialCookies.some(essential => 
        cookieName.startsWith(essential) || cookieName === essential
      );
      
      if (!isEssential && cookieName) {
        // Delete the cookie by setting expiry to past
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });

    // Clear non-essential localStorage items (except our consent keys and auth)
    const essentialStorageKeys = [
      COOKIE_CONSENT_KEY,
      COOKIE_PREFERENCES_KEY,
      "sb-",
      "supabase",
      "theme",
    ];

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const isEssential = essentialStorageKeys.some(essential => 
          key.startsWith(essential) || key === essential
        );
        if (!isEssential) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Don't actually remove storage for now - just block future writes
    // keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const saveConsent = (status: ConsentStatus, prefs: ConsentPreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, status);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setConsentStatus(status);
    setPreferences(prefs);
  };

  const acceptAll = () => {
    saveConsent("accepted", acceptedPreferences);
  };

  const declineAll = () => {
    const declinedPreferences: ConsentPreferences = {
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    saveConsent("declined", declinedPreferences);
  };

  const updatePreferences = (newPreferences: Partial<ConsentPreferences>) => {
    const updated: ConsentPreferences = {
      ...preferences,
      ...newPreferences,
      essential: true, // Always keep essential
    };
    
    // If any non-essential preference is true, consider it "accepted"
    const hasNonEssential = updated.analytics || updated.functional || updated.marketing;
    const status: ConsentStatus = hasNonEssential ? "accepted" : "declined";
    
    saveConsent(status, updated);
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    setConsentStatus("pending");
    setPreferences(defaultPreferences);
  };

  const canSetCookie = (type: keyof ConsentPreferences): boolean => {
    if (type === "essential") return true;
    if (consentStatus === "pending") return false;
    return preferences[type];
  };

  const hasConsented = consentStatus !== "pending";

  return (
    <CookieConsentContext.Provider
      value={{
        consentStatus,
        preferences,
        hasConsented,
        acceptAll,
        declineAll,
        updatePreferences,
        resetConsent,
        canSetCookie,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};
