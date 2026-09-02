# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.5.x   | :white_check_mark: |
| 0.4.x   | :x:                |
| < 0.4   | :x:                |

## Reporting a Vulnerability

We take the security of POE2 HTC seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Create a Public Issue

Please do not create a public GitHub issue for security vulnerabilities, as this could put users at risk.

### 2. Report Privately

Send an email to **dboire@student.42.fr** with:

- **Subject**: `[SECURITY] Brief description of the vulnerability`
- **Description**: Detailed description of the vulnerability
- **Steps to Reproduce**: Clear steps to reproduce the issue
- **Impact**: What an attacker could potentially do
- **Affected Versions**: Which versions are affected
- **Suggested Fix**: If you have one (optional)

### 3. What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Status Updates**: Every week until resolved
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 1-4 weeks
  - Medium: 1-2 months
  - Low: Next scheduled release

### 4. Disclosure Policy

- We will work with you to understand and fix the issue
- We will credit you in the security advisory (if you wish)
- We will coordinate public disclosure with you
- Typical disclosure timeline: 90 days after fix is released

## Security Best Practices for Users

### There is nothing to install

POE2HTC is a web page at **[poe2htc.com](https://poe2htc.com)**. It has no installer and no desktop
build, so there is no file to verify and no updater to trust — you always get the current version by
loading the page.

**If you find a POE2HTC `.exe` or `.AppImage` anywhere, do not run it.** Old Electron builds were
published to GitHub Releases until 2026-08-22 and are frozen at stale game data; anything newer
claiming to be a POE2HTC download did not come from this project.

### Running it

- Every calculation happens **client-side**, in your browser. There is no backend server and no local
  port is opened.
- **No craft is ever sent anywhere to be computed.** What the page does send when something breaks is
  listed under *What leaves your browser* below — stated exactly rather than promised away.

### Permissions

POE2HTC is a web page. There is no installer, no account, no login and no server of ours to talk to:

- **Network**: the patch data and price sheet are downloaded once as static files. Solving is done in
  your browser and sends nothing. Beyond that the page contacts only its error reporting and its
  analytics — see *What leaves your browser* below.
- **Storage**: your workspace is kept in your own browser so a reload does not lose it.
- **No accounts**: nothing to sign in to, so there are no credentials to lose.

### Updates

Reloading the page is the update. Release notes for each version are on the
[Releases](https://github.com/Dboire9/POE2_HTC/releases) page.

## Known Security Considerations

### No Local Server

The app is fully client-side — there is **no backend process** and **no listening port** (the Java
`localhost:8080` server was retired). Nothing to firewall, nothing to authenticate. Crafting
computation happens in the same sandboxed context as the UI.

### The one untrusted input: a shared link

A `?s=` share link is the only thing a stranger can hand the app, and it is parsed before you click
anything. It is decoded defensively: a malformed link is refused rather than throwing (a throw inside
React unmounts the page, which is how one bad link once white-screened the app), and every value it
carries is re-validated on the way in — a link is not a form. Fuzzed in `workspace.test.ts`.

### Browser-level protections

A Content-Security-Policy is served as a **real response header**, not a `<meta>` tag: `script-src`
and `worker-src` are `'self'`, so no third-party script can run; `frame-ancestors 'none'`, so the page
cannot be embedded for clickjacking; `object-src 'none'`; `form-action 'none'`. HSTS is set for two
years, and no cookies are used at all.

### Third-Party Dependencies

We regularly update dependencies to patch known vulnerabilities. `npm audit` is checked in CI and is
currently clean for both the shipped bundle and the build tooling.

Check `npm audit` reports in CI/CD. (There are no Maven dependencies or bundled JRE anymore — the
Java backend was retired.)

## Security Features

### Application

- ✅ **The solver runs entirely in your browser.** No craft is sent anywhere to be computed, and the
  page keeps working with the network off.
- ✅ Open source, and every claim on this page is checkable in the code.
- ✅ A strict Content-Security-Policy served as a real header: no third-party script can execute, and
  the page cannot be framed. No cookies are set.

### What leaves your browser

Stated exactly, because an earlier version of this page said "never your crafting inputs" and that was
**not accurate** — it was written for the desktop build and was not revisited when error reporting
gained session replay.

- **Vercel Analytics** — page views, served from this site's own domain. Aggregate; no profile of you.
- **Sentry**, only when something goes wrong:
  - the error and its stack trace, your browser and OS, and **the page URL** — and a shared-workspace
    link carries your craft in that URL;
  - a **session replay of the minutes before the error**, which records the page as displayed,
    including the base, modifiers, tiers and budget you had on screen. Ordinary sessions are **not**
    recorded (`replaysSessionSampleRate: 0`) — only ones that hit an error;
  - your IP address reaches Sentry as the sender of the request, as it does for any web request.

None of that is an account, a password or a payment detail, because the app has none. It is your
crafting session, and it is captured so a crash can be diagnosed. If you would rather it were not, a
tracker-blocking extension stops Sentry loading and the app works normally without it.

### Development

- ✅ CodeQL scanning and a linter on every push
- ✅ `npm audit` clean, and every workflow declares the minimum permission it needs
- ✅ Automated builds — a release is built by CI from a tag, never uploaded by hand
- ℹ️ This is a solo project: changes are not peer-reviewed, they are gated by the test suite, three
  type-checks and five browser tests. Said plainly rather than claimed as review.

## Questions?

If you have questions about security that don't involve a vulnerability, you can:
- Open a [GitHub Discussion](https://github.com/Dboire9/POE2_HTC/discussions)
- Contact us at dboire@student.42.fr

## Hall of Fame

We appreciate security researchers who help keep our users safe. Contributors will be listed here:

<!-- Security researchers who have responsibly disclosed vulnerabilities will be listed here -->

*No security issues reported yet.*

---

**Thank you for helping keep POE2 HTC secure!** 🛡️
