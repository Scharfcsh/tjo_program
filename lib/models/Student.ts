import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

export const STUDENT_STATUSES = [
  "registered",
  "shortlisted",
  "selected",
  "active",
  "rejected",
] as const

export type StudentStatus = (typeof STUDENT_STATUSES)[number]

const studentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    college: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    semester: { type: String, required: true },
    status: {
      type: String,
      enum: STUDENT_STATUSES,
      default: "registered",
      index: true,
    },
    referralCode: { type: String, required: true, unique: true, index: true },
    shortlistedAt: { type: Date },
    selectedAt: { type: Date },
  },
  { timestamps: true }
)

export type StudentDoc = InferSchemaType<typeof studentSchema> & {
  _id: mongoose.Types.ObjectId
}

export const Student: Model<StudentDoc> =
  (mongoose.models.Student as Model<StudentDoc>) ||
  mongoose.model<StudentDoc>("Student", studentSchema)
