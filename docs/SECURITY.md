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

### Installation

- Download only from official sources:
  - [GitHub Releases](https://github.com/Dboire9/POE2_HTC/releases)
  - Never download from third-party sites
- Verify file checksums if provided
- Use the auto-updater to stay current

### Running the Application

- The application runs locally on your machine
- No data is sent to external servers
- All calculations happen client-side
- Backend server only listens on `localhost:8080`

### Permissions

The application requires:
- **File System**: To store logs and configuration
- **Network**: Only for localhost communication (frontend ↔ backend)
- **No Sensitive Data**: Application doesn't access or store sensitive information

### Updates

- Enable auto-updates in settings
- Review release notes for security fixes
- Keep your system and dependencies updated

## Known Security Considerations

### Local Backend Server

The Java backend runs on `localhost:8080`:
- Only accessible from your machine
- No external network access
- No authentication required (local-only)
- Windows Firewall may prompt - this is normal

### Electron Security

We follow Electron security best practices:
- Context isolation enabled
- Node integration disabled in renderer
- Content Security Policy in place
- No remote code execution

### Third-Party Dependencies

We regularly update dependencies to patch known vulnerabilities:
- Frontend: npm packages
- Backend: Maven dependencies
- Electron framework
- Bundled JRE

Check `npm audit` and Maven dependency reports in CI/CD.

## Security Features

### Application

- ✅ Local execution only
- ✅ No telemetry or tracking
- ✅ No cloud services
- ✅ Open source (auditable)
- ✅ Sandboxed Electron renderer
- ✅ Automatic updates with signature verification

### Development

- ✅ GitHub Actions security scanning
- ✅ Dependency vulnerability checks
- ✅ Code review process for all changes
- ✅ Automated builds (no manual tampering)

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
