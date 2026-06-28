import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

import { SUBMISSION_TYPES } from "../missions-config"

export const SUBMISSION_STATUSES = ["pending", "approved", "rejected"] as const

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

/**
 * A piece of proof a student submits for a manual mission (LinkedIn post,
 * WhatsApp promotion screenshot, review). Admins approve/reject each one; every
 * approved submission counts +1 toward its mission.
 */
const submissionSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    type: { type: String, enum: SUBMISSION_TYPES, required: true },
    url: { type: String, required: true },
    status: {
      type: String,
      enum: SUBMISSION_STATUSES,
      default: "pending",
      index: true,
    },
    note: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
)

submissionSchema.index({ studentId: 1, type: 1, status: 1 })

export type SubmissionDoc = InferSchemaType<typeof submissionSchema> & {
  _id: mongoose.Types.ObjectId
}

export const Submission: Model<SubmissionDoc> =
  (mongoose.models.Submission as Model<SubmissionDoc>) ||
  mongoose.model<SubmissionDoc>("Submission", submissionSchema)
