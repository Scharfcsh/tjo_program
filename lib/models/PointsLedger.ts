import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/**
 * Append-only ledger of points changes for auditability. Each sync writes one
 * entry per mission whose count changed, recording the points delta.
 */
const pointsLedgerSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    missionKey: { type: String, required: true },
    delta: { type: Number, required: true },
    reason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export type PointsLedgerDoc = InferSchemaType<typeof pointsLedgerSchema> & {
  _id: mongoose.Types.ObjectId
}

export const PointsLedger: Model<PointsLedgerDoc> =
  (mongoose.models.PointsLedger as Model<PointsLedgerDoc>) ||
  mongoose.model<PointsLedgerDoc>("PointsLedger", pointsLedgerSchema)
