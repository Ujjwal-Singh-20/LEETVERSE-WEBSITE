import { DomainGroup, PublicMember } from '../types';

export type TierType =
  | 'president'
  | 'vice-president'
  | 'general-secretary'
  | 'joint-general-secretary'
  | 'domain-lead'
  | 'domain-asst-lead'
  | 'member';

export interface TierConfig {
  type: TierType;
  label: string;
  badge: string;
  accentColor: string;
  borderColor: string;
  glowColor: string;
  bgSubtle: string;
  ringColor: string;
  rank: number; // 1 = President, 2 = VP, 3 = Gen Sec, 4 = Joint Gen Sec, 5 = Domain Lead, 6 = Asst Lead, 7 = Member
}

export const TIER_CONFIGS: Record<TierType, TierConfig> = {
  president: {
    type: 'president',
    label: 'President',
    badge: 'PRESIDENT',
    accentColor: '#fbbf24', // Warm Royal Gold / Amber
    borderColor: 'rgba(251, 191, 36, 0.5)',
    glowColor: 'transparent',
    bgSubtle: 'rgba(251, 191, 36, 0.08)',
    ringColor: '#fbbf24',
    rank: 1,
  },
  'vice-president': {
    type: 'vice-president',
    label: 'Vice President',
    badge: 'VICE PRESIDENT',
    accentColor: '#c084fc', // Soft Regal Amethyst
    borderColor: 'rgba(192, 132, 252, 0.5)',
    glowColor: 'transparent',
    bgSubtle: 'rgba(192, 132, 252, 0.08)',
    ringColor: '#c084fc',
    rank: 2,
  },
  'general-secretary': {
    type: 'general-secretary',
    label: 'General Secretary',
    badge: 'GENERAL SECRETARY',
    accentColor: '#6ee7b7', // Crisp Mint Green
    borderColor: 'rgba(110, 231, 183, 0.45)',
    glowColor: 'transparent',
    bgSubtle: 'rgba(110, 231, 183, 0.08)',
    ringColor: '#6ee7b7',
    rank: 3,
  },
  'joint-general-secretary': {
    type: 'joint-general-secretary',
    label: 'Joint General Secretary',
    badge: 'JOINT GENERAL SECRETARY',
    accentColor: '#5eead4', // Seafoam / Aquamarine Green
    borderColor: 'rgba(94, 234, 212, 0.45)',
    glowColor: 'transparent',
    bgSubtle: 'rgba(94, 234, 212, 0.08)',
    ringColor: '#5eead4',
    rank: 4,
  },
  'domain-lead': {
    type: 'domain-lead',
    label: 'Domain Lead',
    badge: 'LEAD',
    accentColor: '#34d399', // Mineral Emerald Green
    borderColor: 'rgba(52, 211, 153, 0.4)',
    glowColor: 'transparent',
    bgSubtle: 'rgba(52, 211, 153, 0.06)',
    ringColor: '#34d399',
    rank: 5,
  },
  'domain-asst-lead': {
    type: 'domain-asst-lead',
    label: 'Asst. Domain Lead',
    badge: 'ASST. LEAD',
    accentColor: '#a7f3d0', // Pale Celadon / Sage Green
    borderColor: 'rgba(167, 243, 208, 0.35)',
    glowColor: 'transparent',
    bgSubtle: 'rgba(167, 243, 208, 0.05)',
    ringColor: '#a7f3d0',
    rank: 6,
  },
  member: {
    type: 'member',
    label: 'Member',
    badge: 'MEMBER',
    accentColor: '#a1b8ac', // Soft Eucalyptus Mist
    borderColor: 'rgba(110, 231, 183, 0.14)',
    glowColor: 'transparent',
    bgSubtle: 'rgba(110, 231, 183, 0.04)',
    ringColor: '#7a9686',
    rank: 7,
  },
};

// Standard dropdown position choices categorized for admin
export const STANDARD_POSITIONS = [
  {
    category: 'Executive Leadership',
    positions: [
      'President',
      'Vice President',
      'General Secretary',
      'Joint General Secretary',
    ],
  },
  {
    category: 'Domain Roles',
    positions: [
      'Lead',
      'Asst. Lead',
      'Core Member',
      'Member',
    ],
  },
];

/**
 * Determine a member's tier configuration based on their position string and optional domain slug.
 */
export function getMemberTier(position: string = '', domainSlug?: string): TierConfig {
  const p = position.toLowerCase().trim();

  // 1. President
  if (p.includes('president') && !p.includes('vice') && !p.includes('vp')) {
    return TIER_CONFIGS['president'];
  }

  // 2. Vice President
  if (
    p.includes('vice president') ||
    p.includes('vice-president') ||
    p.includes('vp') ||
    p.startsWith('vice ')
  ) {
    return TIER_CONFIGS['vice-president'];
  }

  // 3. General Secretary & Joint General Secretary
  if (
    p.includes('general secretary') ||
    p.includes('gen sec') ||
    p.includes('gensec') ||
    p.includes('secretary')
  ) {
    const isJoint =
      p.includes('joint') ||
      p.includes('asst') ||
      p.includes('assistant') ||
      p.includes('deputy') ||
      p.includes('vice');

    if (isJoint) {
      return TIER_CONFIGS['joint-general-secretary'];
    }
    return TIER_CONFIGS['general-secretary'];
  }

  // Assistant check
  const isAssistant =
    p.includes('asst') ||
    p.includes('assistant') ||
    p.includes('co-lead') ||
    p.includes('deputy') ||
    p.includes('vice lead');

  // 4. Domain-level Leads & Assistant Leads
  const isLead =
    p.includes('lead') ||
    p.includes('head') ||
    p.includes('director') ||
    p.includes('chief');

  if (isLead) {
    if (isAssistant) {
      return TIER_CONFIGS['domain-asst-lead'];
    }
    return TIER_CONFIGS['domain-lead'];
  }

  // 5. Regular Member
  return TIER_CONFIGS['member'];
}

export interface HierarchyMember extends PublicMember {
  domainSlug?: string;
  domainName?: string;
  tier: TierConfig;
}

export interface HierarchyGroups {
  presidents: HierarchyMember[];
  vicePresidents: HierarchyMember[];
  generalSecretaries: HierarchyMember[];
  domainGroups: DomainGroup[];
}

export function isExecutiveTier(tierType: TierType): boolean {
  return (
    tierType === 'president' ||
    tierType === 'vice-president' ||
    tierType === 'general-secretary' ||
    tierType === 'joint-general-secretary'
  );
}

/**
 * Group members into leadership hierarchy tiers and domain groups.
 */
export function groupMembersByHierarchy(domains: DomainGroup[]): HierarchyGroups {
  const presidents: HierarchyMember[] = [];
  const vicePresidents: HierarchyMember[] = [];
  const generalSecretaries: HierarchyMember[] = [];

  const seenLeadership = new Set<string>();

  // Deduplicate members within each domain by username
  const dedupedDomains = domains.map((dom) => {
    const seen = new Set<string>();
    const unique = dom.members.filter((m) => {
      if (seen.has(m.username)) return false;
      seen.add(m.username);
      return true;
    });
    return { ...dom, members: unique };
  });

  dedupedDomains.forEach((dom) => {
    dom.members.forEach((m) => {
      const tier = getMemberTier(m.position, dom.slug);
      const hierarchyMember: HierarchyMember = {
        ...m,
        domainSlug: dom.slug,
        domainName: dom.name,
        tier,
      };

      if (tier.type === 'president') {
        if (!seenLeadership.has(m.username)) {
          seenLeadership.add(m.username);
          presidents.push(hierarchyMember);
        }
      } else if (tier.type === 'vice-president') {
        if (!seenLeadership.has(m.username)) {
          seenLeadership.add(m.username);
          vicePresidents.push(hierarchyMember);
        }
      } else if (
        tier.type === 'general-secretary' ||
        tier.type === 'joint-general-secretary'
      ) {
        if (!seenLeadership.has(m.username)) {
          seenLeadership.add(m.username);
          generalSecretaries.push(hierarchyMember);
        }
      }
    });
  });

  // Sort General Secretaries so General Secretary comes before Joint General Secretary
  generalSecretaries.sort((a, b) => a.tier.rank - b.tier.rank);

  // Filter out pure executive/leadership domains from the regular domain cards list if they only hold executive heads
  const filteredDomainGroups = dedupedDomains.filter((d) => {
    const slug = d.slug.toLowerCase();
    if (slug === 'leadership' || slug === 'executive' || slug === 'presidents') {
      const hasNonExec = d.members.some((m) => {
        const t = getMemberTier(m.position, d.slug);
        return !isExecutiveTier(t.type);
      });
      return hasNonExec;
    }
    return true;
  });

  return {
    presidents,
    vicePresidents,
    generalSecretaries,
    domainGroups: filteredDomainGroups,
  };
}

/**
 * Format domain slug or raw name into standardized FULL CAPS title.
 * e.g. cp-dsa -> COMPETITIVE PROGRAMMING, ai-ml -> AI/ML
 */
export function formatDomainName(slug: string = ''): string {
  const s = slug.toLowerCase().trim();
  if (s === 'ai-ml' || s === 'aiml' || s === 'ai/ml') return 'AI/ML';
  if (
    s === 'cp-dsa' ||
    s === 'cp' ||
    s === 'dsa' ||
    s === 'cp dsa' ||
    s === 'competitive-programming' ||
    s === 'competetive-programming' ||
    s === 'competitive programming' ||
    s === 'competetive programming'
  ) {
    return 'COMPETITIVE PROGRAMMING';
  }
  if (s === 'graphic-design' || s === 'design' || s === 'graphics' || s === 'graphic design') {
    return 'GRAPHIC DESIGN';
  }
  if (s === 'marketing-pr' || s === 'marketing' || s === 'pr' || s === 'marketing and pr') {
    return 'MARKETING AND PR';
  }
  if (s === 'cloud' || s === 'cloud-devops' || s === 'cloud devops') {
    return 'CLOUD';
  }
  if (s === 'video-editing' || s === 'vide-editing' || s === 'video' || s === 'video editing' || s === 'vide editing') {
    return 'VIDEO EDITING';
  }
  if (s === 'web-dev' || s === 'web' || s === 'web-development' || s === 'web dev') {
    return 'WEB DEV';
  }
  if (s === 'app-dev' || s === 'app' || s === 'mobile-dev' || s === 'app-development' || s === 'app dev') {
    return 'APP DEV';
  }
  if (
    s === 'data-science' ||
    s === 'data-analytics' ||
    s === 'data-science-and-analytics' ||
    s === 'data-science-and-data-analytics' ||
    s === 'data science' ||
    s === 'data analytics' ||
    s === 'data science and analytics' ||
    s === 'data science and data analytics' ||
    s === 'data science & analytics' ||
    s === 'data science & data analytics'
  ) {
    return 'DATA SCIENCE AND DATA ANALYTICS';
  }
  return slug.replace(/-/g, ' ').toUpperCase();
}
