import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy — TABI Japan Planner' };

export default function PrivacyPage() {
  return <main className="auth-shell"><article className="auth-card" style={{ maxWidth: 760 }}>
    <a className="auth-brand" href="/">旅 <b>TABI</b><small>JAPAN, YOUR WAY</small></a>
    <h1>Your privacy</h1>
    <p>Japan Planner — TABI is operated by Marco Gatti at japan-planner.third-ai.com. Updated 5 October 2026.</p>
    <h2>Information we store</h2>
    <p>You can explore festivals and plan a journey without an account. If you register, we store your email address, display name and account identifier. Email registration stores a salted password hash, rather than your password. Google sign-in stores your Google account identifier and uses your verified email and profile name to create or connect your account. We do not request access to your Gmail, Google Drive, contacts or calendar.</p>
    <p>When you save trips or festival favourites, we store those records with your account so you can access them across devices. Saved trips are private to your account. If you create a share link, anyone with that link can view that trip until you revoke it.</p>
    <h2>How we use the information</h2>
    <p>We use account information to sign you in, protect access to your saved records and display your travel space. We use saved itinerary details and favourites to provide the planning features you choose. We do not sell your personal information or use Google account data for advertising.</p>
    <h2>Cookies and service providers</h2>
    <p>Essential cookies keep you signed in for up to 30 days and secure the Google sign-in process for up to 10 minutes. Signing out removes your active session. Your light or dark theme preference is stored in your browser.</p>
    <p>Cloudflare hosts the application and stores account and trip records in its D1 database. Cloudflare may process network information and service logs to operate and protect the site. Google processes authentication requests when you choose Google sign-in. Map boundaries are served by this site. Opening a linked festival or transport website is subject to that website’s own privacy practices.</p>
    <h2>Retention and your choices</h2>
    <p>Account and saved travel records remain stored until removed. You can remove saved trips and favourites and revoke trip share links in the app. To request access, correction or deletion of your account information, contact <a href="mailto:gattim@gmail.com">gattim@gmail.com</a>. There is currently no self-service account deletion screen.</p>
    <p>You can also remove the app’s access in your Google account settings. This stops future Google sign-in access; it does not automatically delete records already stored in Japan Planner.</p>
    <a href="/">Continue exploring Japan</a>
  </article></main>;
}
