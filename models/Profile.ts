import mongoose, { Schema, type Model } from "mongoose";

export interface IProfile {
  anonymousId?: string;
  username: string;
  name: string;
  avatar?: string;
  role: string;
  bio?: string;
  building?: string;
  techStack: string[];
  xHandle: string;
  github?: string;
  website?: string;
  status?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
    city?: string;
    country?: string;
  };
  publicLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    anonymousId: { type: String, index: true, sparse: true, unique: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
      match: [/^[a-z0-9_]+$/, "username may only contain letters, numbers and underscore"],
    },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    avatar: { type: String, trim: true, default: "" },
    role: { type: String, required: true, trim: true, default: "Developer" },
    bio: { type: String, trim: true, maxlength: 280, default: "" },
    building: { type: String, trim: true, maxlength: 80, default: "" },
    techStack: { type: [String], default: [] },
    xHandle: { type: String, required: true, trim: true, maxlength: 40 },
    github: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    status: { type: String, trim: true, default: "Building" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat] — private, never sent to clients
      city: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "" },
    },
    publicLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // jittered approx coords — safe to share
    },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProfileSchema.index({ publicLocation: "2dsphere" });
ProfileSchema.index({ location: "2dsphere" });
ProfileSchema.index({ role: 1, isVisible: 1 });
ProfileSchema.index({ status: 1, isVisible: 1 });

export const Profile: Model<IProfile> =
  mongoose.models.Profile ?? mongoose.model<IProfile>("Profile", ProfileSchema);
