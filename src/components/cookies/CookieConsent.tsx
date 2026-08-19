import { useEffect, useState } from "react";
import { X, Settings, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type CookieConsent = {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

const STORAGE_KEY = "biraj.cookie-consent";
const DISMISS_KEY = "biraj.cookie-consent-dismissed";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<Omit<CookieConsent, "timestamp">>({
    functional: true, // Always true
    analytics: false,
    marketing: false,
  });

  // Load saved preferences on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) {
      setShowBanner(true);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CookieConsent;
        setPreferences({
          functional: parsed.functional,
          analytics: parsed.analytics,
          marketing: parsed.marketing,
        });
        // Load cookies based on saved preferences
        loadCookies(parsed);
      }
    }
  }, []);

  const loadCookies = (prefs: CookieConsent) => {
    // Load analytics cookies if consented
    if (prefs.analytics) {
      loadGoogleAnalytics();
      loadSentry();
    }

    // Load marketing cookies if consented
    if (prefs.marketing) {
      loadFacebookPixel();
      loadGoogleAds();
    }
  };

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    localStorage.setItem(DISMISS_KEY, "true");
    setPreferences(consent);
    setShowBanner(false);
    loadCookies(consent);
  };

  const handleRejectAll = () => {
    const consent: CookieConsent = {
      functional: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    localStorage.setItem(DISMISS_KEY, "true");
    setPreferences(consent);
    setShowBanner(false);
  };

  const handleSaveCustom = () => {
    const consent: CookieConsent = {
      ...preferences,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    localStorage.setItem(DISMISS_KEY, "true");
    setShowBanner(false);
    loadCookies(consent);
  };

  // Banner View
  if (showBanner && !showSettings) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">🍪 Kolačići i privatnost</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Koristimo kolačiće za sigurnost, analitiku i poboljšanja. Vidi{" "}
                <a href="/politika-kolacica" className="font-medium text-[color:var(--gold-deep)] hover:underline">
                  Politiku kolačića
                </a>{" "}
                za detalje.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="flex-1 sm:flex-none"
              >
                <Settings className="h-4 w-4" />
                Prilagođeno
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                className="flex-1 sm:flex-none"
              >
                Odbij sve
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-none bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]"
                size="sm"
              >
                Prihvati sve
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Settings View
  if (showSettings) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Postavke kolačića</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Strogo potrebni (disabled) */}
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="mt-1 h-4 w-4 cursor-not-allowed"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">Strogo potrebni</p>
                <p className="text-xs text-muted-foreground">
                  Sigurnost, logiranje, CSRF zaštita. Obavezni — ne možete odbiti.
                </p>
              </div>
            </div>

            {/* Funkcionalni */}
            <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) =>
                  setPreferences({ ...preferences, functional: e.target.checked })
                }
                className="mt-1 h-4 w-4"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">Funkcionalni kolačići</p>
                <p className="text-xs text-muted-foreground">
                  Nedavni oglasi, pretraga, preference. Poboljšava iskustvo.
                </p>
              </div>
            </div>

            {/* Analitički */}
            <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences({ ...preferences, analytics: e.target.checked })
                }
                className="mt-1 h-4 w-4"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">Analitički kolačići</p>
                <p className="text-xs text-muted-foreground">
                  Google Analytics, Sentry. Pomažu nam razumjeti korištenje.
                </p>
              </div>
            </div>

            {/* Marketinški */}
            <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) =>
                  setPreferences({ ...preferences, marketing: e.target.checked })
                }
                className="mt-1 h-4 w-4"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">Marketinški kolačići</p>
                <p className="text-xs text-muted-foreground">
                  Facebook Pixel, Google Ads. Personalizirani oglasi i praćenje.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowSettings(false)}
            >
              Otkaži
            </Button>
            <Button
              onClick={handleSaveCustom}
              className="flex-1 bg-[color:var(--navy)] text-[color:var(--cream)] hover:bg-[color:var(--navy-deep)]"
            >
              Spremi postavke
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Možete promijeniti ove postavke bilo vrijeme u Računu → Sigurnost.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// ============ Google Analytics ============
function loadGoogleAnalytics() {
  if (typeof window === "undefined" || (window as any).gtag) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"; // Replace with your GA ID
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", "G-XXXXXXXXXX"); // Replace with your GA ID
}

// ============ Sentry ============
function loadSentry() {
  if (typeof window === "undefined" || (window as any).Sentry) return;

  const script = document.createElement("script");
  script.src = "https://browser.sentry-cdn.com/7.0.0/bundle.min.js";
  script.integrity =
    "sha384-r1dA2+b+8+N3+ck+MZFZBCMqA7X5BtCmDvnpNQb6u2pFpNy4Yv4pf5bNdRf8vB5x";
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);

  script.onload = () => {
    (window as any).Sentry?.init({
      dsn: "YOUR_SENTRY_DSN", // Replace with your Sentry DSN
      environment: process.env.NODE_ENV,
    });
  };
}

// ============ Facebook Pixel ============
function loadFacebookPixel() {
  if (typeof window === "undefined" || (window as any).fbq) return;

  (window as any).fbq = function (...args: any[]) {
    if ((window as any).fbq.callMethod) {
      (window as any).fbq.callMethod.apply((window as any).fbq, arguments);
    } else {
      (window as any).fbq.queue.push(arguments);
    }
  };
  (window as any).fbq.push = (window as any).fbq;
  (window as any).fbq.loaded = true;
  (window as any).fbq.version = "2.0";
  (window as any).fbq.queue = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  (window as any).fbq("init", "YOUR_FACEBOOK_PIXEL_ID"); // Replace with your Pixel ID
  (window as any).fbq("track", "PageView");
}

// ============ Google Ads (Conversion Tracking) ============
function loadGoogleAds() {
  if (typeof window === "undefined" || (window as any).gtag) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX"; // Replace with your Google Ads ID
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", "AW-XXXXXXXXXX"); // Replace with your Google Ads ID
}
