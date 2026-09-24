import type { Opportunity, OpportunityType, Sport } from "@/types/athlete";

type OpportunityTemplate = {
  type: OpportunityType;
  title: string;
  relevance: Opportunity["relevance"];
  organization: (sport: string) => string;
  action: Opportunity["action"];
};

const TEMPLATES: OpportunityTemplate[] = [
  {
    type: "trial",
    title: "State Trials",
    relevance: "Recommended for you",
    organization: (sport) => `${sport} Development Academy`,
    action: "OPEN",
  },
  {
    type: "camp",
    title: "Performance Camp",
    relevance: "High relevance",
    organization: () => "National Development Program",
    action: "VIEW",
  },
  {
    type: "coaching",
    title: "Coaching Opportunity",
    relevance: "Recommended",
    organization: (sport) => `Elite ${sport} Academy`,
    action: "EXPLORE",
  },
  {
    type: "tournament",
    title: "Open Tournament",
    relevance: "New",
    organization: () => "Regional Sports Federation",
    action: "VIEW",
  },
  {
    type: "sponsorship",
    title: "Emerging Talent Grant",
    relevance: "High relevance",
    organization: () => "YouInSports Partner Network",
    action: "EXPLORE",
  },
];

export function buildOpportunities(sport: Sport, sportLabel: string, pick: (n: number) => number): Opportunity[] {
  const indices = [0, 1, 2];
  return indices.map((templateIndex, i) => {
    const template = TEMPLATES[templateIndex % TEMPLATES.length];
    return {
      id: `${sport}-opportunity-${i}-${pick(1000)}`,
      type: template.type,
      title: template.title,
      relevance: template.relevance,
      organization: template.organization(sportLabel),
      action: template.action,
    };
  });
}
