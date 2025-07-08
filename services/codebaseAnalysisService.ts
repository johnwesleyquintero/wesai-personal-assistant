import {
  FileMetrics,
  CodebaseMetrics,
  TechnicalDebtItem,
  Recommendation,
  AnalysisReport,
  DependencyNode,
} from '../types';

// Mock file system data - in a real implementation, this would read from the actual file system
const mockProjectFiles = [
  'App.tsx',
  'LoginPage.tsx',
  'index.tsx',
  'store.ts',
  'types.ts',
  'components/Header.tsx',
  'components/ApiKeyManager.tsx',
  'components/ApiKeySection.tsx',
  'components/TabNavigation.tsx',
  'components/CodeInput.tsx',
  'components/CodeInteractionPanel.tsx',
  'components/ChatInterfacePanel.tsx',
  'components/FeedbackDisplay.tsx',
  'components/LoadingSpinner.tsx',
  'components/ThemeToggleButton.tsx',
  'components/ImageGenerationPanel.tsx',
  'components/DocumentationViewerPanel.tsx',
  'components/ReactPreviewRenderer.tsx',
  'components/PreWithCopyButton.tsx',
  'components/CustomInstructionsPanel.tsx',
  'services/geminiService.ts',
  'services/instructionService.ts',
  'services/codebaseAnalysisService.ts',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.js',
  'eslint.config.js',
  'index.css',
  'index.html',
];

export const analyzeFile = async (filePath: string): Promise<FileMetrics> => {
  // Simulate file analysis - in a real implementation, this would parse actual files
  const name = filePath.split('/').pop() || '';
  const extension = name.split('.').pop() || '';

  // Mock complexity calculation based on file type and size
  const getComplexity = (path: string): number => {
    if (path.includes('store.ts')) return 8.5;
    if (path.includes('geminiService.ts')) return 7.2;
    if (path.includes('App.tsx')) return 6.8;
    if (path.includes('ChatInterfacePanel.tsx')) return 6.5;
    if (path.includes('CodeInteractionPanel.tsx')) return 6.0;
    if (path.includes('ReactPreviewRenderer.tsx')) return 7.8;
    if (path.includes('components/')) return Math.random() * 4 + 2;
    return Math.random() * 3 + 1;
  };

  const getLines = (path: string): number => {
    if (path.includes('store.ts')) return 420;
    if (path.includes('geminiService.ts')) return 380;
    if (path.includes('App.tsx')) return 180;
    if (path.includes('ReactPreviewRenderer.tsx')) return 320;
    if (path.includes('ChatInterfacePanel.tsx')) return 280;
    if (path.includes('CodeInteractionPanel.tsx')) return 250;
    return Math.floor(Math.random() * 200) + 50;
  };

  const getDependencies = (path: string): string[] => {
    if (path.includes('App.tsx'))
      return ['react', 'store.ts', 'LoginPage.tsx', 'components/Header.tsx'];
    if (path.includes('store.ts')) return ['zustand', 'services/geminiService.ts', 'types.ts'];
    if (path.includes('geminiService.ts'))
      return ['@google/genai', 'services/instructionService.ts'];
    if (path.includes('components/')) return ['react', 'types.ts'];
    return [];
  };

  const getFileType = (path: string): FileMetrics['type'] => {
    if (path.includes('components/')) return 'component';
    if (path.includes('services/')) return 'service';
    if (path.includes('types.ts')) return 'type';
    if (path.includes('.config.')) return 'config';
    if (path.includes('store.ts')) return 'utility';
    return 'other';
  };

  return {
    path: filePath,
    name,
    extension,
    lines: getLines(filePath),
    size: getLines(filePath) * 45, // Approximate bytes
    complexity: getComplexity(filePath),
    dependencies: getDependencies(filePath),
    exports: ['default', 'named'],
    type: getFileType(filePath),
  };
};

export const analyzeCodebase = async (): Promise<CodebaseMetrics> => {
  const fileMetrics = await Promise.all(mockProjectFiles.map(analyzeFile));

  const totalFiles = fileMetrics.length;
  const totalLines = fileMetrics.reduce((sum, file) => sum + file.lines, 0);
  const totalSize = fileMetrics.reduce((sum, file) => sum + file.size, 0);
  const averageComplexity =
    fileMetrics.reduce((sum, file) => sum + file.complexity, 0) / totalFiles;

  const filesByType = fileMetrics.reduce(
    (acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const largestFiles = [...fileMetrics].sort((a, b) => b.lines - a.lines).slice(0, 5);

  const mostComplexFiles = [...fileMetrics].sort((a, b) => b.complexity - a.complexity).slice(0, 5);

  const dependencyGraph = buildDependencyGraph(fileMetrics);
  const technicalDebt = identifyTechnicalDebt(fileMetrics);
  const codeQuality = calculateCodeQuality(fileMetrics, technicalDebt);

  return {
    totalFiles,
    totalLines,
    totalSize,
    averageComplexity,
    filesByType,
    largestFiles,
    mostComplexFiles,
    dependencyGraph,
    technicalDebt,
    codeQuality,
  };
};

const buildDependencyGraph = (files: FileMetrics[]): DependencyNode[] => {
  const nodes: DependencyNode[] = [];

  files.forEach((file) => {
    const isExternal = (dep: string) =>
      !dep.includes('.ts') && !dep.includes('.tsx') && !dep.includes('./') && !dep.includes('../');

    nodes.push({
      id: file.path,
      name: file.name,
      type: 'internal',
      dependencies: file.dependencies.filter((dep) => !isExternal(dep)),
      dependents: files.filter((f) => f.dependencies.includes(file.path)).map((f) => f.path),
    });
  });

  // Add external dependencies
  const externalDeps = new Set<string>();
  files.forEach((file) => {
    file.dependencies.forEach((dep) => {
      if (
        !dep.includes('.ts') &&
        !dep.includes('.tsx') &&
        !dep.includes('./') &&
        !dep.includes('../')
      ) {
        externalDeps.add(dep);
      }
    });
  });

  externalDeps.forEach((dep) => {
    nodes.push({
      id: dep,
      name: dep,
      type: 'external',
      dependencies: [],
      dependents: files.filter((f) => f.dependencies.includes(dep)).map((f) => f.path),
    });
  });

  return nodes;
};

const identifyTechnicalDebt = (files: FileMetrics[]): TechnicalDebtItem[] => {
  const debt: TechnicalDebtItem[] = [];

  files.forEach((file) => {
    // Large file debt
    if (file.lines > 300) {
      debt.push({
        file: file.path,
        type: 'size',
        severity: file.lines > 500 ? 'high' : 'medium',
        description: `File is too large (${file.lines} lines)`,
        suggestion: 'Consider breaking this file into smaller, more focused modules',
        effort: file.lines > 500 ? 'high' : 'medium',
      });
    }

    // High complexity debt
    if (file.complexity > 7) {
      debt.push({
        file: file.path,
        type: 'complexity',
        severity: file.complexity > 9 ? 'critical' : 'high',
        description: `High cyclomatic complexity (${file.complexity.toFixed(1)})`,
        suggestion: 'Refactor complex functions into smaller, single-purpose functions',
        effort: 'medium',
      });
    }

    // Too many dependencies
    if (file.dependencies.length > 8) {
      debt.push({
        file: file.path,
        type: 'dependency',
        severity: 'medium',
        description: `Too many dependencies (${file.dependencies.length})`,
        suggestion: 'Consider dependency injection or breaking into smaller modules',
        effort: 'medium',
      });
    }
  });

  return debt;
};

const calculateCodeQuality = (files: FileMetrics[], debt: TechnicalDebtItem[]) => {
  const totalComplexity = files.reduce((sum, file) => sum + file.complexity, 0);
  const avgComplexity = totalComplexity / files.length;

  // Maintainability Index (0-100, higher is better)
  const maintainabilityIndex = Math.max(0, 100 - avgComplexity * 5 - debt.length * 2);

  return {
    maintainabilityIndex: Math.round(maintainabilityIndex),
    testCoverage: 0, // Would need actual test analysis
    duplicatedLines: Math.floor(files.reduce((sum, file) => sum + file.lines, 0) * 0.05),
    codeSmells: debt.filter((d) => d.severity === 'medium' || d.severity === 'high').length,
    securityHotspots: debt.filter((d) => d.type === 'dependency').length,
    bugs: 0, // Would need static analysis
    vulnerabilities: 0, // Would need security analysis
  };
};

export const generateRecommendations = async (
  metrics: CodebaseMetrics,
): Promise<Recommendation[]> => {
  const recommendations: Recommendation[] = [];

  // Large file recommendations
  metrics.largestFiles.forEach((file) => {
    if (file.lines > 300) {
      recommendations.push({
        id: `large-file-${file.path}`,
        category: 'maintainability',
        priority: file.lines > 500 ? 'high' : 'medium',
        title: `Refactor large file: ${file.name}`,
        description: `${file.name} has ${file.lines} lines, making it difficult to maintain and understand.`,
        impact: 'Improved readability, easier testing, better separation of concerns',
        effort: file.lines > 500 ? 'high' : 'medium',
        files: [file.path],
        codeExample: `// Consider splitting into multiple files:
// ${file.name.replace('.tsx', '')}Types.ts
// ${file.name.replace('.tsx', '')}Hooks.ts  
// ${file.name.replace('.tsx', '')}Utils.ts`,
        resources: [
          'https://refactoring.guru/extract-class',
          'https://martinfowler.com/bliki/FunctionLength.html',
        ],
      });
    }
  });

  // Complexity recommendations
  metrics.mostComplexFiles.forEach((file) => {
    if (file.complexity > 7) {
      recommendations.push({
        id: `complex-file-${file.path}`,
        category: 'maintainability',
        priority: file.complexity > 9 ? 'critical' : 'high',
        title: `Reduce complexity in ${file.name}`,
        description: `${file.name} has high cyclomatic complexity (${file.complexity.toFixed(1)}), making it error-prone.`,
        impact: 'Reduced bugs, easier testing, improved maintainability',
        effort: 'medium',
        files: [file.path],
        codeExample: `// Extract complex logic into smaller functions:
const processData = (data) => {
  const validated = validateData(data);
  const transformed = transformData(validated);
  return formatOutput(transformed);
};`,
        resources: [
          'https://refactoring.guru/extract-method',
          'https://en.wikipedia.org/wiki/Cyclomatic_complexity',
        ],
      });
    }
  });

  // Architecture recommendations
  if (metrics.averageComplexity > 6) {
    recommendations.push({
      id: 'overall-complexity',
      category: 'architecture',
      priority: 'high',
      title: 'Implement better separation of concerns',
      description:
        'Overall codebase complexity is high. Consider implementing cleaner architecture patterns.',
      impact: 'Better maintainability, easier testing, improved team productivity',
      effort: 'high',
      files: metrics.mostComplexFiles.map((f) => f.path),
      codeExample: `// Consider implementing:
// - Custom hooks for business logic
// - Service layer for API calls
// - Utility functions for common operations
// - Context providers for state management`,
      resources: [
        'https://kentcdodds.com/blog/application-state-management-with-react',
        'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html',
      ],
    });
  }

  // Performance recommendations
  const largeComponents = metrics.largestFiles.filter(
    (f) => f.type === 'component' && f.lines > 200,
  );
  if (largeComponents.length > 0) {
    recommendations.push({
      id: 'component-performance',
      category: 'performance',
      priority: 'medium',
      title: 'Optimize large React components',
      description: 'Large components may cause performance issues and should be optimized.',
      impact: 'Better rendering performance, improved user experience',
      effort: 'medium',
      files: largeComponents.map((c) => c.path),
      codeExample: `// Consider using:
import { memo, useMemo, useCallback } from 'react';

const OptimizedComponent = memo(({ data, onAction }) => {
  const processedData = useMemo(() => 
    expensiveProcessing(data), [data]
  );
  
  const handleAction = useCallback((id) => 
    onAction(id), [onAction]
  );
  
  return <div>{/* component JSX */}</div>;
});`,
      resources: [
        'https://react.dev/reference/react/memo',
        'https://react.dev/reference/react/useMemo',
      ],
    });
  }

  return recommendations;
};

export const generateAnalysisReport = async (): Promise<AnalysisReport> => {
  const metrics = await analyzeCodebase();
  const recommendations = await generateRecommendations(metrics);

  return {
    timestamp: new Date(),
    metrics,
    recommendations,
    trends: [], // Would be populated with historical data
  };
};
