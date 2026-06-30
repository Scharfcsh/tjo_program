import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

export const ONBOARDING_TASK_KEYS = [
  "accountCreated",
  "profileCompleted",
  "referrals",
  "socialShared",
] as const

export type OnboardingTaskKey = (typeof ONBOARDING_TASK_KEYS)[number]

const taskSchema = new Schema(
  {
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    source: { type: String }, // "mock" | "live" | "self"
    detail: { type: String }, // e.g. "12 referrals"
    count: { type: Number }, // referrals count, when applicable
    missing: { type: [String], default: undefined }, // incomplete profile fields
    url: { type: String }, // submitted evidence URL (socialShared)
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
    }, // admin review state (socialShared)
  },
  { _id: false }
)

const onboardingSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
      index: true,
    },
    accountCreated: { type: taskSchema, default: () => ({}) },
    profileCompleted: { type: taskSchema, default: () => ({}) },
    referrals: { type: taskSchema, default: () => ({}) },
    socialShared: { type: taskSchema, default: () => ({}) },
  },
  { timestamps: true }
)

export type OnboardingDoc = InferSchemaType<typeof onboardingSchema> & {
  _id: mongoose.Types.ObjectId
}

export const Onboarding: Model<OnboardingDoc> =
  (mongoose.models.Onboarding as Model<OnboardingDoc>) ||
  mongoose.model<OnboardingDoc>("Onboarding", onboardingSchema)
