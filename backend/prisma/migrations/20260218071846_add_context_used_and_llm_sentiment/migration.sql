-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "context_used" JSONB,
ADD COLUMN     "sentimentDeviation" DOUBLE PRECISION,
ADD COLUMN     "sentimentLLM" TEXT;
