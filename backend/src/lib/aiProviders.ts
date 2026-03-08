import { env } from "../config/env.js";

export type AnalysisType = "journey" | "cohort" | "element" | "general";

export interface FrictionEventSnapshot {
  eventType: string;
  pageUrl: string;
  severityScore: number;
}

export interface AiAnalyzeInput {
  analysisType: AnalysisType;
  model: string;
  context?: string;
  events: FrictionEventSnapshot[];
}

export interface AiAnalyzeOutput {
  summary: string;
  recommendations: string[];
  confidence: number;
}

export interface AiProvider {
  readonly id: string;
  analyze(input: AiAnalyzeInput): Promise<AiAnalyzeOutput>;
}

class HeuristicAiProvider implements AiProvider {
  readonly id = "heuristic";

  async analyze(input: AiAnalyzeInput): Promise<AiAnalyzeOutput> {
    const totalEvents = input.events.length;
    const severeEvents = input.events.filter((event) => event.severityScore >= 7);
    const highSeverityRatio = totalEvents > 0 ? severeEvents.length / totalEvents : 0;

    const topPages = [...input.events.reduce((acc, event) => {
      const current = acc.get(event.pageUrl) ?? 0;
      acc.set(event.pageUrl, current + 1);
      return acc;
    }, new Map<string, number>()).entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([page, count]) => `${page} (${count})`);

    const recommendations: string[] = [];
    if (severeEvents.length > 0) {
      recommendations.push("Prioritize high-severity pages for immediate UX fixes and monitor post-release changes.");
    }

    if (highSeverityRatio > 0.35) {
      recommendations.push("Run a focused usability test on the highest-friction flow and compare by device/browser cohort.");
    }

    if (topPages.length > 0) {
      recommendations.push(`Start with the top impacted pages: ${topPages.join(", ")}.`);
    }

    if (recommendations.length === 0) {
      recommendations.push("Friction is currently low; continue monitoring and expand instrumentation coverage.");
    }

    const confidence = Math.max(0.45, Math.min(0.92, 0.45 + Math.min(totalEvents, 50) * 0.009));

    return {
      summary: [
        `Analysis type: ${input.analysisType}`,
        `Model: ${input.model}`,
        `Events analyzed: ${totalEvents}`,
        `High severity events: ${severeEvents.length}`,
        input.context ? `Context: ${input.context}` : null
      ]
        .filter(Boolean)
        .join("\n"),
      recommendations,
      confidence: Number(confidence.toFixed(2))
    };
  }
}

class MockAiProvider implements AiProvider {
  readonly id = "mock";

  async analyze(input: AiAnalyzeInput): Promise<AiAnalyzeOutput> {
    return {
      summary: `Mock analysis for ${input.analysisType} with ${input.events.length} events using model ${input.model}.`,
      recommendations: [
        "Mock recommendation: validate instrumentation on your highest-conversion page.",
        "Mock recommendation: compare friction between mobile and desktop users."
      ],
      confidence: 0.5
    };
  }
}

const providers: Record<string, AiProvider> = {
  heuristic: new HeuristicAiProvider(),
  mock: new MockAiProvider()
};

export const getAiProvider = (): AiProvider => {
  return providers[env.AI_PROVIDER] ?? providers.heuristic;
};
