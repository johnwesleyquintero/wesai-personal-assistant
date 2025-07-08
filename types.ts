export type ActiveTab =
  | 'review'
  | 'refactor'
  | 'preview'
  | 'generate'
  | 'chat'
  | 'documentation'
  | 'content'
  | 'image'
  | 'custom-instructions'
  | 'codebase-analysis';
export type ApiKeySource = 'ui' | 'env' | 'none';
export type Theme = 'light' | 'dark';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  componentCode?: string | null; // Extracted React component code string, if any
  showPreview?: boolean; // Toggles between code view and preview view for this message
}

export interface CustomInstructionProfile {
  id: string; // Unique identifier
  name: string;
  instructions: string;
  isActive: boolean; // Only one can be true at a time
}

export interface FileMetrics {
  path: string;
  name: string;
  extension: string;
  lines: number;
  size: number;
  complexity: number;
  dependencies: string[];
  exports: string[];
  lastModified?: Date;
  type: 'component' | 'service' | 'utility' | 'config' | 'type' | 'other';
}

export interface CodebaseMetrics {
  totalFiles: number;
  totalLines: number;
  totalSize: number;
  averageComplexity: number;
  filesByType: Record<string, number>;
  largestFiles: FileMetrics[];
  mostComplexFiles: FileMetrics[];
  dependencyGraph: DependencyNode[];
  technicalDebt: TechnicalDebtItem[];
  codeQuality: CodeQualityMetrics;
}

export interface DependencyNode {
  id: string;
  name: string;
  type: 'internal' | 'external';
  dependencies: string[];
  dependents: string[];
  cyclic?: boolean;
}

export interface TechnicalDebtItem {
  file: string;
  line?: number;
  type: 'complexity' | 'duplication' | 'size' | 'dependency' | 'naming' | 'structure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion: string;
  effort: 'low' | 'medium' | 'high';
}

export interface CodeQualityMetrics {
  maintainabilityIndex: number;
  testCoverage: number;
  duplicatedLines: number;
  codeSmells: number;
  securityHotspots: number;
  bugs: number;
  vulnerabilities: number;
}

export interface AnalysisReport {
  timestamp: Date;
  metrics: CodebaseMetrics;
  recommendations: Recommendation[];
  trends: AnalysisTrend[];
}

export interface Recommendation {
  id: string;
  category: 'performance' | 'maintainability' | 'security' | 'architecture' | 'best-practices';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  files: string[];
  codeExample?: string;
  resources?: string[];
}

export interface AnalysisTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'improving' | 'declining' | 'stable';
}
