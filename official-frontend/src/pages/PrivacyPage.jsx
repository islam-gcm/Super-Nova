import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo nova.svg';
import Footer from '../components/common/Footer';
import ThemeToggle from '../components/common/ThemeToggle';

const sectionClass = 'space-y-3 border-t border-slate-200 pt-7 dark:border-slate-800';
const headingClass = 'text-xl font-bold text-slate-950 dark:text-white';

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | SuperNova';
    window.scrollTo(0, 0);
    return () => { document.title = 'SuperNova'; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 dark:bg-[#080e1b] dark:text-slate-300">
      <header className="border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-[#0b1220]/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-3 font-bold text-slate-950 dark:text-white">
            <img src={logo} alt="" className="h-10 w-10" /> SuperNova
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300">Back to website</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-7 sm:py-16">
        <div className="space-y-3">
          <p className="text-sm font-bold uppercase tracking-widest text-pink-600 dark:text-pink-400">SuperNova Scientific Club</p>
          <h1 className="text-4xl font-black text-slate-950 dark:text-white sm:text-5xl">Privacy Policy</h1>
          <p>Last updated: 12 October 2026</p>
          <p>This notice explains how the SuperNova Scientific Club of the Faculty of Sciences, University of Boumerdes, handles information on its public website, application form, and private Virtual Club.</p>
        </div>

        <section className={sectionClass}>
          <h2 className={headingClass}>Information you provide</h2>
          <p>When you apply, we collect your name, email address, phone number, field of study, university, preferred department, and the skills, interests, motivation, and availability details you choose to submit. Lead and HR members use this information to review applications and communicate decisions.</p>
          <p>For members, we keep account details such as name, email, role, department, and a password hash. We also record workspace activity needed to run the club, including tasks, submissions, reviews, notifications, points, and last login time. Some member names and scores appear on the member leaderboard. Club leaders and other authorized roles can access information needed for their work.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Cookies and browser storage</h2>
          <p>The Virtual Club sets an <code>accessToken</code> cookie when you log in or activate an account. It keeps you signed in for up to 24 hours and is cleared when you log out. It is HTTP-only, and it is marked Secure when the site runs in production over HTTPS. This cookie is used for member authentication.</p>
          <p>The public website saves your light or dark theme choice in your browser&apos;s local storage. That preference is not a cookie. You can clear cookies and local storage in your browser settings; clearing the login cookie signs you out.</p>
          <p>The current application code does not set advertising or analytics cookies. If that changes, we will update this notice and add any choice controls required for those technologies.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>IP addresses and logs</h2>
          <p>Our API receives technical request information, including IP addresses. It uses IP information to help limit abusive requests. For account activation, application decisions, and administrative or task actions, audit records may include the actor, action, time, IP address, browser user agent, and the changes made. Hosting providers may also keep request logs under their own settings. We use these records to operate, secure, and troubleshoot the service.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Service providers and external sites</h2>
          <p>Our hosting and database providers process information needed to run the service. If decision emails are enabled, the configured email provider receives the recipient address and email content. The Virtual Club loads Google Fonts, and your browser may send technical request data to Google when fetching those fonts. External social links take you to services with their own privacy practices. We do not sell your personal information for advertising.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>How long information stays</h2>
          <p>The platform does not currently apply an automatic deletion period to applications, member records, tasks, or audit records. These records remain until the club deletes them. Hosting request logs are retained according to the host&apos;s settings. The login cookie expires after up to 24 hours; your theme choice remains in your browser until you clear it.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Questions and requests</h2>
          <p>You can ask a club Lead or HR member through the club&apos;s existing contact channels about access to, correction of, or removal of information you submitted. We will review requests in light of the club&apos;s operational needs and applicable requirements. Please do not send passwords or other sensitive information through social media. A dedicated privacy contact address will be added when the club confirms one.</p>
          <p>We may update this page if our tools or data practices change. The date above shows the latest version.</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
