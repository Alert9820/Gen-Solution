export type ServiceCategory = 
  | 'Data Scraping & Ingestion'
  | 'Agent Training & RAG'
  | 'Contextual Chatbot'
  | 'Automated Workflows'
  | 'Continuous Sync & Security';

export interface AIAgentService {
  id: string;
  title: string;
  category: ServiceCategory;
  tagline: string;
  description: string;
  howWeDoIt: string;
  technicalDeliverables: string[];
  clientBenefit: string;
  iconName: string;
}

export interface DeliveryPhase {
  phase: string;
  days: string;
  title: string;
  objective: string;
  developerActions: string[];
  clientInvolvement: string;
  milestoneOutput: string;
  status: 'planning' | 'active' | 'complete';
}

export interface SafetyPrecaution {
  id: string;
  title: string;
  subtitle: string;
  threatPrevented: string;
  technicalImplementation: string;
  guarantee: string;
  iconName: string;
}

export interface ClientCareCommitment {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  developerAttention: string;
  deliverableProof: string;
  iconName: string;
}

export interface AIPackage {
  id: string;
  name: string;
  price: string;
  monthlyPrice?: string;
  turnaroundTime: string;
  bestFor: string;
  badge?: string;
  description: string;
  scrapingScope: string;
  agentCapabilities: string[];
  automationsIncluded: string[];
  securityAndPrecautions: string[];
  developerAttention: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isContextCard?: boolean;
  contextType?: 'contact' | 'scraping' | 'precautions' | 'timeline' | 'packages' | 'general';
  metadata?: {
    email?: string;
    phone?: string;
    hours?: string;
    responseTime?: string;
    actionLabel?: string;
    actionType?: string;
    tags?: string[];
  };
}

export interface ScrapedPageSample {
  url: string;
  title: string;
  chunksExtracted: number;
  dataPoints: string[];
  status: 'scraped' | 'vectorized' | 'grounded';
}

export interface EnterprisePillar {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  summary: string;
  highlightStat: string;
  highlightLabel: string;
  keyCapabilities: string[];
  enterpriseImpact: string;
  architectureDetails: string;
  iconName: string;
}

export interface ComparisonMetric {
  feature: string;
  category: string;
  genericChatbot: string;
  genneoEnterprise: string;
  advantage: string;
  criticalForEnterprise: boolean;
}

export interface IndustrySolution {
  id: string;
  industry: string;
  headline: string;
  description: string;
  dataSources: string[];
  agentWorkflow: string;
  provenOutcome: string;
  complianceBadge: string;
  iconName: string;
}
