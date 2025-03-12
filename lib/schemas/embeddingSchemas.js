import { z } from "zod";

// Schema for table structure
export const TableSchemaItemSchema = z.object({
  tableName: z.string(),
  columns: z.string()
});

// Create a recursive type for handling nested data structures
const JsonValueSchema = z.lazy(() => 
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(JsonValueSchema)
  ])
);

// Schema for sample data
export const SampleDataItemSchema = z.object({
  tableName: z.string(),
  sampleData: z.array(z.record(JsonValueSchema))
});

// Schema for the complete query embeddings response
export const QueryEmbeddingsSchema = z.object({
  schema: z.array(TableSchemaItemSchema),
  sampleData: z.array(SampleDataItemSchema)
});