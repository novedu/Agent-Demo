import type { EvaluationContext, EvaluationResult } from './trace-types';

export interface Evaluator {
  evaluate: (context: EvaluationContext) => EvaluationResult;
}

export class RuleBasedEvaluator implements Evaluator {
  evaluate(context: EvaluationContext): EvaluationResult {
    const finalAnswer = context.finalAnswer ?? '';
    const successfulTools = context.toolResults.filter((tool) => tool.success !== false);
    const failedTools = context.toolResults.filter((tool) => tool.success === false);

    const completeness = scoreBoolean(
      finalAnswer.includes('##') && finalAnswer.length > 120 && successfulTools.length > 0,
    );
    const accuracy = clampScore(0.85 - failedTools.length * 0.15);
    const groundedness = clampScore(context.ragDocuments.length > 0 ? 0.9 : 0.55);
    const taskCompletion = scoreBoolean(Boolean(finalAnswer) && failedTools.length === 0);

    const score = Number(((completeness + accuracy + groundedness + taskCompletion) / 4).toFixed(2));
    const feedback: string[] = [];

    if (completeness < 0.8) {
      feedback.push('回答结构或内容完整度不足，建议补充结论、原因和行动建议。');
    }
    if (accuracy < 0.8) {
      feedback.push('存在工具失败或数据缺口，建议复核工具调用结果。');
    }
    if (groundedness < 0.8) {
      feedback.push('回答缺少 RAG 检索证据，建议补充知识来源。');
    }
    if (taskCompletion < 0.8) {
      feedback.push('任务未完全完成，建议触发重试或人工复核。');
    }
    if (feedback.length === 0) {
      feedback.push('评估通过：回答完整、工具结果可用，并包含知识库依据。');
    }

    return {
      score,
      criteria: {
        completeness,
        accuracy,
        groundedness,
        taskCompletion,
      },
      feedback,
    };
  }
}

function scoreBoolean(value: boolean): number {
  return value ? 0.9 : 0.45;
}

function clampScore(value: number): number {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}
