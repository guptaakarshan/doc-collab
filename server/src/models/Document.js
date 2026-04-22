import mongoose from "mongoose";

// Collaborators can read/edit a document depending on assigned role.
const collaboratorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["editor", "viewer"],
      default: "viewer",
    },
  },
  { _id: false },
);

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "Untitled Document",
      maxlength: 200,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    collaborators: {
      type: [collaboratorSchema],
      default: [],
    },
    // Start with plain Quill snapshot (Delta JSON) before introducing CRDT.
    contentDelta: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ ops: [{ insert: "\n" }] }),
    },

    contentYjs: {
      type: Buffer,
      default: null,
    },
    // HTML is useful for quick previews in list/detail UI.
    contentHtml: {
      type: String,
      default: "",
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
