# Security Scanner False Positives

This document explains known false positives from security scanners and why they should be ignored.

## FP-001: "Obsolete Encryption Algorithm" in Test Files

### Affected Files
- `code/test/Token42.test.ts:70`
- `code/test/Token42.test.ts:135`
- `code/test/Token42.test.ts:154`

### Flagged Code
```typescript
// Line 70
).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");

// Line 135
).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");

// Line 154
).to.be.revertedWithCustomError(token, "ERC20InvalidReceiver");
```

### Alert Type
- **Category**: Cryptography / Obsolete Algorithm
- **Severity**: Medium/High (incorrectly assigned)
- **Scanner**: Various SAST tools (Semgrep, SonarQube, Checkmarx, etc.)

### Why This Is A False Positive

#### 1. No Cryptographic Operations
The flagged lines contain **zero cryptographic operations**. They are:
- Hardhat/Chai test matchers (`revertedWithCustomError`)
- String literals representing OpenZeppelin error names
- Unit test assertions, not encryption code

#### 2. What These Actually Do
```typescript
// This is a TEST ASSERTION that verifies:
// "When this transaction runs, it should fail (revert)
//  with the specific error named 'ERC20InsufficientBalance'"
await expect(
  token.connect(addr1).transfer(owner.address, amount)
).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
```

**Breakdown**:
| Component | Purpose |
|-----------|---------|
| `await expect(...)` | Chai assertion wrapper |
| `token.connect(addr1).transfer(...)` | Smart contract call being tested |
| `.to.be.revertedWithCustomError()` | Hardhat matcher for revert errors |
| `"ERC20InsufficientBalance"` | OpenZeppelin v5 custom error NAME |

#### 3. OpenZeppelin Custom Errors (ERC-6093)
These are **standardized error names** from [OpenZeppelin Contracts v5](https://docs.openzeppelin.com/contracts/5.x/):

| Error Name | Meaning | EIP Reference |
|------------|---------|---------------|
| `ERC20InsufficientBalance` | Sender doesn't have enough tokens | ERC-6093 |
| `ERC20InsufficientAllowance` | Spender not approved for amount | ERC-6093 |
| `ERC20InvalidReceiver` | Transfer to zero address | ERC-6093 |

These are **not algorithms**. They are error identifiers following [EIP-6093: Custom errors for ERC tokens](https://eips.ethereum.org/EIPS/eip-6093).

#### 4. Scanner Misinterpretation
The scanner likely matches patterns like:
- `ERC20` + `Insufficient` → Confused with cipher/key operations
- Words like "revert", "error" → Associated with crypto failures
- Hexadecimal-looking patterns in test data

### Resolution

#### Option A: Inline Annotations (Applied)
```typescript
// security:ignore-line false-positive - OpenZeppelin error name, not crypto
).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
```

#### Option B: Scanner Configuration (Recommended)
Exclude test directories from cryptographic analysis:

**Semgrep (.semgrep.yml)**:
```yaml
paths:
  exclude:
    - "**/test/**"
    - "**/*.test.ts"
```

**SonarQube (sonar-project.properties)**:
```properties
sonar.exclusions=**/test/**,**/*.test.ts
sonar.security.exclusions=**/test/**
```

**Snyk (.snyk)**:
```yaml
exclude:
  global:
    - "**/test/**"
```

#### Option C: Rule Exclusion
Disable specific crypto rules for test files only.

### Impact Assessment

| Aspect | Risk Level | Justification |
|--------|------------|---------------|
| Actual crypto vulnerability | **NONE** | No encryption code present |
| Code execution risk | **NONE** | Test files, not production |
| CI/CD blocking | **Low** | Should be excluded from security gates |
| Audit report pollution | **Medium** | Creates noise, reduces credibility |

### Recommendation
1. **Do NOT modify the test code logic** - it's correct
2. **Configure scanner to exclude `test/` directories** from crypto analysis
3. **Document this false positive** for audit transparency
4. **Add inline comments** for additional clarity

### References
- [OpenZeppelin Contracts v5 Changelog](https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v5.0.0)
- [EIP-6093: Custom errors for commonly-used tokens](https://eips.ethereum.org/EIPS/eip-6093)
- [Hardhat Chai Matchers](https://hardhat.org/hardhat-chai-matchers/docs/reference)

---

## FP-002: Future False Positives

Document additional false positives here as they are identified.

---

*Last Updated: December 2024*
*Reviewed By: Security Team*
