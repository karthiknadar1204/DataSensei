import { z } from "zod";

// Analysis response schema
export const AnalysisSchema = z.object({
  type: z.literal("analysis"),
  content: z.object({
    summary: z.string(),
    details: z.array(z.string()),
    metrics: z.record(z.union([z.string(), z.number()]))
  })
});

// Visualization response schema
export const VisualizationSchema = z.object({
  type: z.literal("visualization"),
  data: z.object({
    type: z.literal("visualization"),
    content: z.object({
      title: z.string(),
      summary: z.string(),
      details: z.array(z.string()),
      metrics: z.record(z.union([z.string(), z.number()]))
    }),
    visualization: z.object({
      chartType: z.string(),
      data: z.array(z.object({
        label: z.string(),
        value: z.number()
      })),
      config: z.object({
        xAxis: z.object({
          label: z.string(),
          type: z.string()
        }),
        yAxis: z.object({
          label: z.string(),
          type: z.string()
        }),
        legend: z.boolean(),
        stacked: z.boolean()
      })
    })
  })
});

// Clarification response schema
export const ClarificationSchema = z.object({
  type: z.literal("clarification"),
  content: z.object({
    question: z.string(),
    options: z.array(z.object({
      type: z.string(),
      description: z.string()
    }))
  })
});

// Inquire response schema
export const InquireSchema = z.object({
  question: z.string(),
  context: z.string(),
  options: z.array(z.string()),
  allowCustomInput: z.boolean(),
  inputType: z.string()
});

// Task Manager response schema
export const TaskManagerSchema = z.object({
  next: z.enum(["inquire", "visualize", "analyze"]),
  reason: z.string()
});

// Query Suggestor response schema
export const QuerySuggestorSchema = z.object({
  related: z.array(z.string()),
  categories: z.object({
    deeper: z.array(z.string()),
    broader: z.array(z.string()),
    actionable: z.array(z.string())
  })
});

// Combined schema for researcher agent
export const CombinedResearcherSchema = z.union([
  AnalysisSchema,
  VisualizationSchema,
  ClarificationSchema
]);