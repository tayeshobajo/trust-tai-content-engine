/**
 * Cost Tracking — Budget model, per-render cost logging, pre-action cost estimates,
 * stalled-task detection
 *
 * QA coverage: Section 22 (Cost and Time Control)
 */

// ─── Budget Model ─────────────────────────────────────────────────────────────

export type CostCategory = "image" | "video" | "audio" | "narration" | "coherence-check"

export interface BudgetEntry {
  id: string
  productionId: string
  category: CostCategory
  description: string
  cost: number
  /** Credits or USD */
  unit: "credits" | "usd"
  shotNo?: number
  model: string
  timestamp: string
}

export interface ProductionBudget {
  productionId: string
  /** Total estimated budget */
  estimatedBudget: number
  /** Total actually spent */
  spent: number
  /** Remaining */
  remaining: number
  /** Per-category breakdown */
  byCategory: Record<CostCategory, number>
  /** Individual cost entries */
  entries: BudgetEntry[]
  /** Whether budget is exceeded */
  isExceeded: boolean
  /** Warning threshold (0-1) */
  warningThreshold: number
  /** Whether budget is in warning zone */
  isWarning: boolean
}

// ─── Cost Store ───────────────────────────────────────────────────────────────

const costStore = new Map<string, BudgetEntry[]>()
const budgetStore = new Map<string, { estimated: number; warningThreshold: number }>()

/**
 * Sets the estimated budget for a production.
 */
export function setProductionBudget(
  productionId: string,
  estimatedBudget: number,
  warningThreshold: number = 0.8,
): void {
  budgetStore.set(productionId, { estimated: estimatedBudget, warningThreshold })
}

/**
 * Logs a cost entry for a render action.
 */
export function logCost(
  productionId: string,
  category: CostCategory,
  description: string,
  cost: number,
  model: string,
  unit: "credits" | "usd" = "credits",
  shotNo?: number,
): BudgetEntry {
  const entry: BudgetEntry = {
    id: `cost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productionId,
    category,
    description,
    cost,
    unit,
    shotNo,
    model,
    timestamp: new Date().toISOString(),
  }

  if (!costStore.has(productionId)) costStore.set(productionId, [])
  costStore.get(productionId)!.push(entry)

  return entry
}

/**
 * Gets the full budget status for a production.
 */
export function getProductionBudget(productionId: string): ProductionBudget {
  const entries = costStore.get(productionId) ?? []
  const budgetConfig = budgetStore.get(productionId)

  const estimatedBudget = budgetConfig?.estimated ?? 0
  const warningThreshold = budgetConfig?.warningThreshold ?? 0.8

  const byCategory = entries.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.cost
      return acc
    },
    {} as Record<CostCategory, number>,
  )

  const spent = entries.reduce((sum, e) => sum + e.cost, 0)
  const remaining = Math.max(0, estimatedBudget - spent)
  const isExceeded = estimatedBudget > 0 && spent > estimatedBudget
  const isWarning = estimatedBudget > 0 && !isExceeded && spent / estimatedBudget >= warningThreshold

  return {
    productionId,
    estimatedBudget,
    spent,
    remaining,
    byCategory,
    entries,
    isExceeded,
    warningThreshold,
    isWarning,
  }
}

// ─── Pre-Action Cost Estimate ─────────────────────────────────────────────────

export interface CostEstimate {
  action: string
  estimatedCost: number
  unit: "credits" | "usd"
  breakdown: { item: string; cost: number }[]
  /** Whether the production has budget remaining */
  withinBudget: boolean
  /** Projected remaining after this action */
  projectedRemaining: number
}

/**
 * Estimates the cost of a planned render action before executing.
 */
export function estimateActionCost(
  productionId: string,
  action: string,
  items: { item: string; cost: number }[],
  unit: "credits" | "usd" = "credits",
): CostEstimate {
  const budget = getProductionBudget(productionId)
  const estimatedCost = items.reduce((sum, i) => sum + i.cost, 0)
  const projectedRemaining = budget.remaining - estimatedCost

  return {
    action,
    estimatedCost,
    unit,
    breakdown: items,
    withinBudget: projectedRemaining >= 0,
    projectedRemaining,
  }
}

// ─── Stalled Task Detection ───────────────────────────────────────────────────

export type TaskStatus = "idle" | "queued" | "in-progress" | "rendered" | "failed" | "stalled"

export interface StalledTask {
  shotNo: number
  status: TaskStatus
  queuedAt?: string
  lastUpdated?: string
  stalledMinutes: number
  description: string
}

/**
 * Detects tasks that have been queued or in-progress for too long without updates.
 */
export function detectStalledTasks(
  shots: { no: number; motionStatus?: string; description: string }[],
): StalledTask[] {
  const stalled: StalledTask[] = []

  for (const shot of shots) {
    if (shot.motionStatus === "queued" || shot.motionStatus === "in-progress") {
      // In a real system, we'd track the actual timestamp
      // For now, we flag any shot sitting in queued/in-progress state
      stalled.push({
        shotNo: shot.no,
        status: shot.motionStatus as TaskStatus,
        stalledMinutes: 0, // Would be calculated from actual timestamps
        description: shot.description,
      })
    }
  }

  return stalled
}
