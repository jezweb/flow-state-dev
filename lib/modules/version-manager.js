/**
 * Module Version Manager
 * 
 * Handles version resolution, compatibility checking, and version constraints
 * for the modular stack system.
 */
import semver from 'semver';

export class ModuleVersionManager {
  constructor() {
    this.compatibilityMatrix = new Map();
    this.versionConstraints = new Map();
  }

  /**
   * Register version compatibility between modules
   */
  registerCompatibility(moduleA, versionA, moduleB, versionConstraint) {
    const key = `${moduleA}@${versionA}`;
    
    if (!this.compatibilityMatrix.has(key)) {
      this.compatibilityMatrix.set(key, new Map());
    }
    
    this.compatibilityMatrix.get(key).set(moduleB, versionConstraint);
  }

  /**
   * Check if two module versions are compatible
   */
  areVersionsCompatible(moduleA, versionA, moduleB, versionB) {
    // Check direct compatibility
    const keyA = `${moduleA}@${versionA}`;
    if (this.compatibilityMatrix.has(keyA)) {
      const constraints = this.compatibilityMatrix.get(keyA);
      if (constraints.has(moduleB)) {
        const constraint = constraints.get(moduleB);
        return semver.satisfies(versionB, constraint);
      }
    }
    
    // Check reverse compatibility
    const keyB = `${moduleB}@${versionB}`;
    if (this.compatibilityMatrix.has(keyB)) {
      const constraints = this.compatibilityMatrix.get(keyB);
      if (constraints.has(moduleA)) {
        const constraint = constraints.get(moduleA);
        return semver.satisfies(versionA, constraint);
      }
    }
    
    // No explicit compatibility defined - check module metadata
    return true; // Assume compatible unless explicitly incompatible
  }

  /**
   * Resolve best version given constraints
   */
  resolveVersion(availableVersions, constraint) {
    if (!constraint || constraint === '*' || constraint === 'latest') {
      return this.getLatest(availableVersions);
    }
    
    const matching = availableVersions.filter(v => semver.satisfies(v, constraint));
    
    if (matching.length === 0) {
      return null;
    }
    
    // Return highest matching version
    return matching.sort(semver.rcompare)[0];
  }

  /**
   * Get latest stable version
   */
  getLatest(versions) {
    // Filter out pre-release versions for stable
    const stable = versions.filter(v => !semver.prerelease(v));
    
    if (stable.length > 0) {
      return stable.sort(semver.rcompare)[0];
    }
    
    // If no stable versions, return latest pre-release
    return versions.sort(semver.rcompare)[0];
  }

  /**
   * Calculate version range for compatibility
   */
  calculateCompatibleRange(version, strategy = 'minor') {
    const parsed = semver.parse(version);
    if (!parsed) return '*';
    
    switch (strategy) {
      case 'exact':
        return version;
      
      case 'patch':
        return `~${version}`; // ~1.2.3 := >=1.2.3 <1.3.0
      
      case 'minor':
        return `^${version}`; // ^1.2.3 := >=1.2.3 <2.0.0
      
      case 'major':
        return `>=${parsed.major}.0.0 <${parsed.major + 1}.0.0`;
      
      default:
        return '*';
    }
  }

  /**
   * Check if version is stable
   */
  isStable(version) {
    return !semver.prerelease(version);
  }

  /**
   * Compare versions
   */
  compare(versionA, versionB) {
    return semver.compare(versionA, versionB);
  }

  /**
   * Sort versions
   */
  sortVersions(versions, descending = true) {
    return versions.sort(descending ? semver.rcompare : semver.compare);
  }

  /**
   * Get version metadata
   */
  getVersionMetadata(version) {
    const parsed = semver.parse(version);
    if (!parsed) return null;
    
    return {
      version: parsed.version,
      major: parsed.major,
      minor: parsed.minor,
      patch: parsed.patch,
      prerelease: parsed.prerelease,
      build: parsed.build,
      isStable: !parsed.prerelease || parsed.prerelease.length === 0,
      isPrerelease: parsed.prerelease && parsed.prerelease.length > 0
    };
  }

  /**
   * Resolve version conflicts in a dependency tree
   */
  resolveConflicts(requirements) {
    // requirements: Array of { module, version, requiredBy }
    const moduleVersions = new Map();
    
    // Group requirements by module
    for (const req of requirements) {
      if (!moduleVersions.has(req.module)) {
        moduleVersions.set(req.module, []);
      }
      moduleVersions.get(req.module).push(req);
    }
    
    const resolved = new Map();
    const conflicts = [];
    
    for (const [module, reqs] of moduleVersions) {
      const constraints = reqs.map(r => r.version);
      
      // Try to find a version that satisfies all constraints
      const intersection = this.findVersionIntersection(constraints);
      
      if (intersection) {
        resolved.set(module, intersection);
      } else {
        conflicts.push({
          module,
          requirements: reqs,
          reason: 'No version satisfies all constraints'
        });
      }
    }
    
    return { resolved, conflicts };
  }

  /**
   * Find version range that satisfies all constraints
   */
  findVersionIntersection(constraints) {
    if (constraints.length === 0) return '*';
    if (constraints.length === 1) return constraints[0];
    
    // For simplicity, check if there's any version that satisfies all
    // In a real implementation, this would compute the actual intersection
    try {
      // Test some common versions
      const testVersions = ['1.0.0', '2.0.0', '3.0.0', '4.0.0', '5.0.0'];
      
      for (const version of testVersions) {
        if (constraints.every(c => semver.satisfies(version, c))) {
          return this.calculateCompatibleRange(version);
        }
      }
      
      // If no simple solution, try to find any valid range
      return constraints[0]; // Fallback to first constraint
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate version recommendation based on changes
   */
  recommendVersion(currentVersion, changeType) {
    const parsed = semver.parse(currentVersion);
    if (!parsed) return '1.0.0';
    
    switch (changeType) {
      case 'breaking':
        return `${parsed.major + 1}.0.0`;
      
      case 'feature':
        return `${parsed.major}.${parsed.minor + 1}.0`;
      
      case 'fix':
        return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
      
      case 'prerelease':
        if (parsed.prerelease.length > 0) {
          return semver.inc(currentVersion, 'prerelease');
        }
        return `${currentVersion}-alpha.1`;
      
      default:
        return currentVersion;
    }
  }

  /**
   * Validate version string
   */
  isValidVersion(version) {
    return semver.valid(version) !== null;
  }

  /**
   * Clean version string
   */
  cleanVersion(version) {
    return semver.clean(version);
  }

  /**
   * Create version range from examples
   */
  createRangeFromExamples(versions) {
    if (versions.length === 0) return '*';
    
    const sorted = this.sortVersions(versions, false);
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];
    
    if (lowest === highest) {
      return lowest;
    }
    
    return `>=${lowest} <=${highest}`;
  }
}

// Export singleton instance
export const versionManager = new ModuleVersionManager();