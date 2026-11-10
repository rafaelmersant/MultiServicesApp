// Match ECFUserAuthentication.max_age_seconds in the Django backend.
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const keys = ["ms_userId", "ms_email", "ms_name", "ms_role", "ms_companyId", "ms_companyName", "ms_apiToken"];
let redirecting = false;

export function sessionExpiresAt(token = localStorage.getItem("ms_apiToken")) {
  if (!token || typeof token !== "string") return 0;
  // Django TimestampSigner: encoded payload : base62 timestamp : signature.
  const parts = token.split(":");
  if (parts.length !== 3 || !parts[0] || !parts[2] || !/^[0-9A-Za-z]{1,9}$/.test(parts[1])) return 0;
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const seconds = [...parts[1]].reduce((value, digit) => value * 62 + alphabet.indexOf(digit), 0);
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds * 1000 + SESSION_MAX_AGE_MS : 0;
}

export function hasStoredSession() {
  return Boolean(localStorage.getItem("ms_email") || localStorage.getItem("ms_apiToken"));
}

export function isSessionActive() {
  return Boolean(localStorage.getItem("ms_email") && localStorage.getItem("ms_apiToken") && sessionExpiresAt() > Date.now());
}

export function clearStoredSession() {
  const email = localStorage.getItem("ms_email");
  if (email) localStorage.setItem("ms_rememberedEmail", email);
  keys.forEach(key => localStorage.removeItem(key));
}

export function expireSession() {
  clearStoredSession();
  if (redirecting || /\/login\/?$/.test(window.location.pathname)) return;
  redirecting = true;
  const current = window.location.pathname + window.location.search;
  if (!/\/(login|logout)\/?$/.test(window.location.pathname)) sessionStorage.setItem("ms_sessionReturnTo", current);
  window.location.replace("/login?expired=1");
}

export function consumeSessionReturnTo() {
  const destination = sessionStorage.getItem("ms_sessionReturnTo");
  sessionStorage.removeItem("ms_sessionReturnTo");
  return destination && destination.startsWith("/") && !destination.startsWith("//") && !/^\/(login|logout)(?:[/?]|$)/.test(destination) ? destination : null;
}

export function isSessionRejection(status, data) {
  const detail = typeof data === "string" ? data : (data && data.detail) || "";
  return status === 401 || (status === 403 && /sesión expir|token de sesión inválido|la cuenta ya no está disponible|authentication credentials were not provided|token.*expired|invalid token/i.test(String(detail)));
}

export function watchSessionExpiry() {
  let timer;
  let authenticated = hasStoredSession();
  const check = () => {
    clearTimeout(timer);
    if (!hasStoredSession()) {
      if (authenticated) expireSession();
      return;
    }
    authenticated = true;
    if (!isSessionActive()) { expireSession(); return; }
    timer = setTimeout(check, Math.max(1, sessionExpiresAt() - Date.now()));
  };
  const storageChanged = event => { if (!event.key || keys.includes(event.key)) check(); };
  window.addEventListener("focus", check);
  window.addEventListener("storage", storageChanged);
  document.addEventListener("visibilitychange", check);
  check();
  return () => {
    clearTimeout(timer);
    window.removeEventListener("focus", check);
    window.removeEventListener("storage", storageChanged);
    document.removeEventListener("visibilitychange", check);
  };
}
