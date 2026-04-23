import Document from "../models/Document.js";
import User from "../models/User.js";
import * as Y from "yjs";
import { getIO } from "../socket.js";

/* ------------------ HELPERS ------------------ */

function normalizeId(value) {
  if (value && typeof value === "object" && value._id) {
    return value._id.toString();
  }
  return value?.toString();
}

function getRole(document, userId) {
  const uid = normalizeId(userId);
  if (!uid) return "none";

  if (normalizeId(document.owner) === uid) return "owner";

  const collaborator = document.collaborators.find(
    (entry) => normalizeId(entry.user) === uid
  );

  return collaborator?.role || "none";
}

function canRead(role) {
  return ["owner", "editor", "viewer"].includes(role);
}

function canEdit(role) {
  return ["owner", "editor"].includes(role);
}

/* ------------------ CREATE ------------------ */

export async function createDocument(req, res) {
  try {
    const { title } = req.body;

    const document = await Document.create({
      title: title?.trim() || "Untitled Document",
      owner: req.userId,
      contentDelta: { ops: [{ insert: "\n" }] }, // keep for migration
      contentYjs: null,
      contentHtml: "",
      lastEditedBy: req.userId,
    });

    // Notify the owner
    try {
      getIO().to(`user-${req.userId}`).emit("document-created", document);
    } catch (e) {
      console.log('Socket error', e);
    }

    return res.status(201).json({
      document: {
        id: document._id,
        title: document.title,
        role: "owner",
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create document",
      error: error.message,
    });
  }
}

/* ------------------ LIST ------------------ */

export async function listDocuments(req, res) {
  try {
    const documents = await Document.find({
      $or: [{ owner: req.userId }, { "collaborators.user": req.userId }],
    })
      .sort({ updatedAt: -1 })
      .select("title owner collaborators updatedAt createdAt");

    const items = documents.map((document) => ({
      id: document._id,
      title: document.title,
      role: getRole(document, req.userId),
      updatedAt: document.updatedAt,
      createdAt: document.createdAt,
    }));

    return res.status(200).json({ documents: items });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to list documents",
      error: error.message,
    });
  }
}

/* ------------------ GET (YJS + MIGRATION) ------------------ */

export async function getDocumentById(req, res) {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const role = getRole(document, req.userId);
    if (!canRead(role)) {
      return res.status(403).json({ message: "No access" });
    }

    let contentYjs = document.contentYjs;

    /* 🔥 MIGRATION: Delta → Yjs */
    if (!contentYjs) {
      const ydoc = new Y.Doc();
      const yText = ydoc.getText("quill");

      const delta = document.contentDelta || { ops: [{ insert: "\n" }] };

      // simple text conversion
      const text = delta.ops.map((op) => op.insert || "").join("");
      yText.insert(0, text);

      const state = Y.encodeStateAsUpdate(ydoc);

      document.contentYjs = Buffer.from(state);
      await document.save();

      contentYjs = state;
    }

    return res.status(200).json({
      document: {
        id: document._id,
        title: document.title,
        owner: document.owner,
        role,
        collaborators: document.collaborators,
        contentHtml: document.contentHtml,
        updatedAt: document.updatedAt,
        createdAt: document.createdAt,
      },
      contentYjs: Array.from(contentYjs),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch document",
      error: error.message,
    });
  }
}

/* ------------------ UPDATE (SAVE YJS) ------------------ */

export async function updateDocument(req, res) {
  try {
    const { documentId } = req.params;
    const { title, contentYjs, contentHtml } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const role = getRole(document, req.userId);
    if (!canEdit(role)) {
      return res.status(403).json({ message: "No edit access" });
    }

    if (typeof title === "string") {
      document.title = title.trim() || document.title;
    }

    // ✅ Save Yjs state
    if (contentYjs) {
      document.contentYjs = Buffer.from(contentYjs);
    }

    // optional preview
    if (contentHtml !== undefined) {
      document.contentHtml = contentHtml;
    }

    document.lastEditedBy = req.userId;

    await document.save();

    // Emit title update if it changed
    if (typeof title === "string") {
      try {
        const io = getIO();
        io.to(`doc-${documentId}`).emit("title-updated", { documentId, title: document.title });
        
        // Also notify users for their dashboards
        io.to(`user-${document.owner}`).emit("document-updated", { documentId, title: document.title });
        document.collaborators.forEach(c => {
          io.to(`user-${c.user}`).emit("document-updated", { documentId, title: document.title });
        });
      } catch (e) {
        console.log('Socket error', e);
      }
    }

    return res.status(200).json({
      document: {
        id: document._id,
        title: document.title,
        role,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update document",
      error: error.message,
    });
  }
}

/* ------------------ SHARE ------------------ */

export async function shareDocument(req, res) {
  try {
    const { documentId } = req.params;
    const { email, role } = req.body;

    if (!email || !["editor", "viewer"].includes(role)) {
      return res.status(400).json({
        message: "Valid email and role are required",
      });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (normalizeId(document.owner) !== normalizeId(req.userId)) {
      return res.status(403).json({
        message: "Only owner can share this document",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }

    if (normalizeId(user._id) === normalizeId(document.owner)) {
      return res.status(400).json({
        message: "Owner already has access",
      });
    }

    const existing = document.collaborators.find(
      (entry) => normalizeId(entry.user) === normalizeId(user._id)
    );

    if (existing) {
      existing.role = role;
    } else {
      document.collaborators.push({ user: user._id, role });
    }

    await document.save();
    
    // Notify users
    try {
      const io = getIO();
      // Notify the person who just got access
      io.to(`user-${user._id}`).emit("document-shared", { documentId, title: document.title, role });
      // Notify everyone currently viewing the document
      io.to(`doc-${documentId}`).emit("collaborators-updated", { documentId, collaborators: document.collaborators });
    } catch (e) {
      console.log('Socket error', e);
    }

    return res.status(200).json({
      message: "Document shared successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to share document",
      error: error.message,
    });
  }
}

/* ------------------ DELETE ------------------ */

export async function deleteDocument(req, res) {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (normalizeId(document.owner) !== normalizeId(req.userId)) {
      return res.status(403).json({
        message: "Only owner can delete",
      });
    }

    const ownerId = document.owner;
    const collabs = document.collaborators.map(c => c.user);
    
    await document.deleteOne();

    try {
      const io = getIO();
      // Notify people in the doc
      io.to(`doc-${documentId}`).emit("document-deleted", { documentId });
      // Notify owner's dashboard
      io.to(`user-${ownerId}`).emit("document-deleted", { documentId });
      // Notify collaborators' dashboards
      collabs.forEach(userId => {
        io.to(`user-${userId}`).emit("document-deleted", { documentId });
      });
    } catch (e) {
      console.log('Socket error', e);
    }

    return res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete document",
      error: error.message,
    });
  }
}