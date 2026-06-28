import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

import { MISSION_KEYS } from "../missions-config"

const statsShape = MISSION_KEYS.reduce<Record<string, { type: typeof Number; default: number }>>(
  (acc, key) => {
    acc[key] = { type: Number, default: 0 }
    return acc
  },
  {}
)

const missionSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
      index: true,
    },
    stats: { type: new Schema(statsShape, { _id: false }), default: () => ({}) },
    pointsTotal: { type: Number, default: 0, index: true },
    lastSyncedAt: { type: Date },
    whatsappJoined: { type: Boolean, default: false },
    whatsappJoinedAt: { type: Date },
  },
  { timestamps: true }
)

export type MissionDoc = InferSchemaType<typeof missionSchema> & {
  _id: mongoose.Types.ObjectId
}

export const Mission: Model<MissionDoc> =
  (mongoose.models.Mission as Model<MissionDoc>) ||
  mongoose.model<MissionDoc>("Mission", missionSchema)
