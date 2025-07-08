import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { 
  AnalysisReport, 
  CodebaseMetrics, 
  Recommendation, 
  TechnicalDebtItem,
  FileMetrics 
} from '../types.ts';
import { generateAnalysisReport } from '../services/codebaseAnalysisService.ts';

export const CodebaseAnalysisPanel: React.FC = () => {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'files' | 'debt' | 'recommendations'>('overview');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const analysisReport = await generateAnalysisReport();
      setReport(analysisReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run analysis on component mount
    handleAnalyze();
  }, []);

  const renderOverview = () => {
    if (!report) return null;
    const { metrics } = report;

    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Files"
            value={metrics.totalFiles}
            icon="📁"
            color="blue"
          />
          <MetricCard
            title="Lines of Code"
            value={metrics.totalLines.toLocaleString()}
            icon="📝"
            color="green"
          />
          <MetricCard
            title="Avg Complexity"
            value={metrics.averageComplexity.toFixed(1)}
            icon="🔄"
            color={metrics.averageComplexity > 6 ? "red" : "yellow"}
          />
          <MetricCard
            title="Code Quality"
            value={`${metrics.codeQuality.maintainabilityIndex}/100`}
            icon="⭐"
            color={metrics.codeQuality.maintainabilityIndex > 70 ? "green" : "red"}
          />
        </div>

        {/* File Types Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            File Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(metrics.filesByType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {type}s
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Debt Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Technical Debt Overview
          </h3>
          <div className="space-y-3">
            {['critical', 'high', 'medium', 'low'].map(severity => {
              const count = metrics.technicalDebt.filter(item => item.severity === severity).length;
              const colors = {
                critical: 'bg-red-500',
                high: 'bg-orange-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500'
              };
              return (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${colors[severity as keyof typeof colors]}`}></div>
                    <span className="capitalize text-gray-700 dark:text-gray-300">{severity}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderFiles = () => {
    if (!report) return null;
    const { metrics } = report;

    return (
      <div className="space-y-6">
        {/* Largest Files */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Largest Files
          </h3>
          <div className="space-y-3">
            {metrics.largestFiles.map((file, index) => (
              <FileItem key={file.path} file={file} rank={index + 1} metric="lines" />
            ))}
          </div>
        </div>

        {/* Most Complex Files */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Most Complex Files
          </h3>
          <div className="space-y-3">
            {metrics.mostComplexFiles.map((file, index) => (
              <FileItem key={file.path} file={file} rank={index + 1} metric="complexity" />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTechnicalDebt = () => {
    if (!report) return null;
    const { metrics } = report;

    const debtByType = metrics.technicalDebt.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, TechnicalDebtItem[]>);

    return (
      <div className="space-y-6">
        {Object.entries(debtByType).map(([type, items]) => (
          <div key={type} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white capitalize">
              {type} Issues ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <DebtItem key={`${item.file}-${index}`} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!report) return null;
    const { recommendations } = report;

    const recsByCategory = recommendations.reduce((acc, rec) => {
      if (!acc[rec.category]) acc[rec.category] = [];
      acc[rec.category].push(rec);
      return acc;
    }, {} as Record<string, Recommendation[]>);

    return (
      <div className="space-y-6">
        {Object.entries(recsByCategory).map(([category, recs]) => (
          <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white capitalize">
              {category} ({recs.length})
            </h3>
            <div className="space-y-4">
              {recs.map((rec) => (
                <RecommendationItem key={rec.id} recommendation={rec} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Codebase Analysis
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive analysis of your codebase quality and structure
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading && <LoadingSpinner />}
          <span>{isLoading ? 'Analyzing...' : 'Re-analyze'}</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-md p-4">
          <strong>Analysis Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !report && (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Analyzing your codebase...
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {report && !isLoading && (
        <>
          {/* Navigation Tabs */}
          <div className="border-b border-gray-300 dark:border-gray-700">
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'files', label: 'Files', icon: '📁' },
                { id: 'debt', label: 'Technical Debt', icon: '⚠️' },
                { id: 'recommendations', label: 'Recommendations', icon: '💡' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeView === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeView === 'overview' && renderOverview()}
            {activeView === 'files' && renderFiles()}
            {activeView === 'debt' && renderTechnicalDebt()}
            {activeView === 'recommendations' && renderRecommendations()}
          </div>
        </>
      )}
    </div>
  );
};

// Helper Components
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  };

  return (
    <div className={`rounded-lg p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
};

interface FileItemProps {
  file: FileMetrics;
  rank: number;
  metric: 'lines' | 'complexity';
}

const FileItem: React.FC<FileItemProps> = ({ file, rank, metric }) => {
  const value = metric === 'lines' ? file.lines : file.complexity.toFixed(1);
  const unit = metric === 'lines' ? 'lines' : 'complexity';

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">
          {rank}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{file.path}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{unit}</p>
      </div>
    </div>
  );
};

interface DebtItemProps {
  item: TechnicalDebtItem;
}

const DebtItem: React.FC<DebtItemProps> = ({ item }) => {
  const severityColors = {
    critical: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    high: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
    low: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
  };

  return (
    <div className={`p-4 rounded-lg border ${severityColors[item.severity]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
              {item.severity}
            </span>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
              {item.type}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{item.description}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            <strong>File:</strong> {item.file}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            <strong>Suggestion:</strong> {item.suggestion}
          </p>
        </div>
        <div className="ml-4 text-xs text-gray-500 dark:text-gray-400">
          {item.effort} effort
        </div>
      </div>
    </div>
  );
};

interface RecommendationItemProps {
  recommendation: Recommendation;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({ recommendation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${priorityColors[recommendation.priority]}`}></div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {recommendation.title}
            </h4>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
              {recommendation.effort} effort
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {recommendation.description}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>Impact:</strong> {recommendation.impact}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Affected Files:
              </h5>
              <div className="flex flex-wrap gap-1">
                {recommendation.files.map((file) => (
                  <span
                    key={file}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                  >
                    {file}
                  </span>
                ))}
              </div>
            </div>

            {recommendation.codeExample && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Code Example:
                </h5>
                <pre className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded overflow-x-auto">
                  {recommendation.codeExample}
                </pre>
              </div>
            )}

            {recommendation.resources && recommendation.resources.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Resources:
                </h5>
                <ul className="space-y-1">
                  {recommendation.resources.map((resource, index) => (
                    <li key={index}>
                      <a
                        href={resource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {resource}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};