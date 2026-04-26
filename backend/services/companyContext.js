const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/companyContext.json');

// Default company context
const DEFAULT_CONTEXT = {
  vehicles: [],
  setAside: [],
  capabilities: [],
  relationships: [],
  knownGaps: [],
  teamMembers: []
};

/**
 * Load company context from JSON file or return default
 */
const getCompanyContext = async () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[Company Context] Error reading file:', error.message);
  }
  return DEFAULT_CONTEXT;
};

/**
 * Save company context to JSON file
 */
const updateCompanyContext = async (contextData) => {
  try {
    // Validate structure
    if (!contextData || typeof contextData !== 'object') {
      throw new Error('Context must be an object');
    }

    const normalizeTeamMembers = (members) => {
      if (!Array.isArray(members)) return [];

      return members
        .map((member) => {
          if (!member || typeof member !== 'object') return null;
          const name = String(member.name || '').trim();
          if (!name) return null;

          const role = String(member.role || '').trim();
          const experienceYears = Number.isFinite(Number(member.experienceYears))
            ? Number(member.experienceYears)
            : 0;

          const skills = Array.isArray(member.skills)
            ? member.skills.map((skill) => String(skill).trim()).filter(Boolean)
            : String(member.skills || '')
              .split(',')
              .map((skill) => skill.trim())
              .filter(Boolean);

          return {
            id: member.id ? String(member.id) : undefined,
            name,
            role,
            experienceYears,
            skills
          };
        })
        .filter(Boolean);
    };

    const validatedContext = {
      vehicles: Array.isArray(contextData.vehicles) ? contextData.vehicles : [],
      setAside: Array.isArray(contextData.setAside) ? contextData.setAside : [],
      capabilities: Array.isArray(contextData.capabilities) ? contextData.capabilities : [],
      relationships: Array.isArray(contextData.relationships) ? contextData.relationships : [],
      knownGaps: Array.isArray(contextData.knownGaps) ? contextData.knownGaps : [],
      teamMembers: normalizeTeamMembers(contextData.teamMembers)
    };

    // Ensure directory exists
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(validatedContext, null, 2));
    return validatedContext;
  } catch (error) {
    console.error('[Company Context] Error saving context:', error.message);
    throw error;
  }
};

/**
 * Format company context for inclusion in LLM prompt
 */
const formatForPrompt = (context) => {
  if (!context || Object.keys(context).length === 0) {
    return 'No company context available.';
  }

  const sections = [];

  if (context.vehicles && context.vehicles.length > 0) {
    sections.push(`Company Vehicles: ${context.vehicles.join(', ')}`);
  }

  if (context.setAside && context.setAside.length > 0) {
    sections.push(`Set-Aside Designations: ${context.setAside.join(', ')}`);
  }

  if (context.capabilities && context.capabilities.length > 0) {
    sections.push(`Core Capabilities: ${context.capabilities.join(', ')}`);
  }

  if (context.relationships && context.relationships.length > 0) {
    const relStr = context.relationships
      .map(r => `${r.agency} (${r.strength})`)
      .join(', ');
    sections.push(`Key Relationships: ${relStr}`);
  }

  if (context.knownGaps && context.knownGaps.length > 0) {
    sections.push(`Known Gaps to Address: ${context.knownGaps.join(', ')}`);
  }

  if (context.teamMembers && context.teamMembers.length > 0) {
    const memberStr = context.teamMembers
      .slice(0, 20)
      .map((member) => {
        const role = member.role ? ` - ${member.role}` : '';
        const skills = Array.isArray(member.skills) && member.skills.length > 0
          ? ` [${member.skills.slice(0, 8).join(', ')}]`
          : '';
        return `${member.name}${role}${skills}`;
      })
      .join('; ');
    sections.push(`Team Members: ${memberStr}`);
  }

  return sections.length > 0 ? sections.join('\n') : 'No company context available.';
};

module.exports = {
  getCompanyContext,
  updateCompanyContext,
  formatForPrompt
};
