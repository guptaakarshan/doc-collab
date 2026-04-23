import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import EditorView from "../components/Editor/EditorPage";
import Toolbar from "../components/Editor/Toolbar";
import { useAuth } from "../context/useAuth";
import api from "../api/axios";
import { socket } from "../api/socket";

import * as Y from "yjs";
import { QuillBinding } from "y-quill";
import { WebsocketProvider } from "y-websocket";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function EditorPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isNewDocument = documentId === "new";

  const [title, setTitle] = useState("Untitled Document");
  const [role, setRole] = useState("owner");
  const [collaborators, setCollaborators] = useState([]);
  const [presence, setPresence] = useState([]);
  const [loading, setLoading] = useState(true);

  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");
  const [shareLoading, setShareLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editorRef = useRef(null);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const quillRef = useRef(null);
  const bindingRef = useRef(null);
  const lastTitleRef = useRef(title);
  const draftRoomRef = useRef(
    `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  /* ------------------ INIT YJS ------------------ */
  useEffect(() => {
    if (!documentId) return;
    const editorElement = editorRef.current;

    let isMounted = true;
    let removeAwarenessListener = () => {};

    async function init() {
      let handleAwarenessChange = null;
      let provider = null;
      const rolePriority = { owner: 3, editor: 2, viewer: 1 };

      try {
        setLoading(true);

        if (!editorElement) {
          return;
        }

        const ydoc = new Y.Doc();

        let docData = null;

        // ✅ ONLY fetch if NOT new document
        if (!isNewDocument) {
          const res = await api.get(`/documents/${documentId}`);
          const { document, contentYjs } = res.data;

          docData = document;

          // metadata
          setTitle(document.title);
          setRole(document.role);
          setCollaborators(
            (document.collaborators || []).map((entry) => ({
              key:
                entry?.user?._id ||
                entry?.user ||
                `${entry?.email || "collab"}-${entry?.role || "viewer"}`,
              name: entry?.user?.name || entry?.user?.email || "Collaborator",
              role: entry?.role || "viewer",
            })),
          );

          // apply saved Yjs state
          if (contentYjs) {
            const update = new Uint8Array(contentYjs);
            Y.applyUpdate(ydoc, update);
          }
        } else {
          // 🆕 new doc defaults
          setTitle("Untitled Document");
          setRole("owner");
          setCollaborators([]);
        }

        const roomName = isNewDocument ? draftRoomRef.current : documentId;
        const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:5000/yjs";
        provider = new WebsocketProvider(wsUrl, roomName, ydoc);

        const yText = ydoc.getText("quill");

        editorElement.innerHTML = "";

        const quill = new Quill(editorElement, {
          theme: "snow",
          placeholder: "Start typing...",
          modules: {
            toolbar: "#collab-toolbar",
            history: {
              delay: 1000,
              maxStack: 100,
              userOnly: true,
            },
          },
          formats: ["bold", "italic", "underline", "list", "link"],
        });

        quillRef.current = quill;
        const toolbar = quill.getModule("toolbar");

        // ✅ FIX: force toggle to work with Yjs
        function toggleFormat(format) {
          quill.focus();
          const range = quill.getSelection();
          if (!range) return;

          const currentFormats = quill.getFormat(range);
          quill.format(format, !currentFormats[format]);
        }
        // override default handlers (this is the key fix)
        toolbar.addHandler("bold", () => toggleFormat("bold"));
        toolbar.addHandler("italic", () => toggleFormat("italic"));
        toolbar.addHandler("underline", () => toggleFormat("underline"));

        const binding = new QuillBinding(yText, quill, provider.awareness);

        provider.awareness.setLocalStateField("user", {
          id: user?.id || user?._id || user?.email,
          email: user?.email,
          name: user?.name || "User",
          role: isNewDocument ? "owner" : docData?.role || "viewer",
          color: "#6366f1",
        });

        // We only use awareness for remote cursors now, not for active counts list
        handleAwarenessChange = () => {};

        provider.awareness.on("change", handleAwarenessChange);
        handleAwarenessChange();

        if (!isMounted) {
          binding?.destroy?.();
          provider?.awareness?.setLocalState(null);
          provider?.disconnect?.();
          provider?.destroy?.();
          ydoc?.destroy();
          return;
        }

        ydocRef.current = ydoc;
        providerRef.current = provider;

        bindingRef.current = binding;

        // ✅ permissions
        const canEdit =
          isNewDocument ||
          docData?.role === "owner" ||
          docData?.role === "editor";

        quill.enable(canEdit);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load document");
      } finally {
        setLoading(false);
      }

      if (handleAwarenessChange) {
        removeAwarenessListener = () => {
          provider.awareness.off("change", handleAwarenessChange);
        };
      }
    }

    init();

    return () => {
      isMounted = false;
      removeAwarenessListener();
      bindingRef.current?.destroy?.();
      bindingRef.current = null;
      if (providerRef.current) {
        providerRef.current.awareness?.setLocalState(null);
        providerRef.current.disconnect?.();
        providerRef.current.destroy?.();
        providerRef.current = null;
      }
      ydocRef.current?.destroy();
      ydocRef.current = null;
      quillRef.current = null;

      if (editorElement) {
        editorElement.innerHTML = "";
      }
    };
  }, [documentId, isNewDocument, user?.email, user?.id, user?._id, user?.name]);

  useEffect(() => {
    const awareness = providerRef.current?.awareness;
    if (!awareness) return;

    const currentState = awareness.getLocalState()?.user || {};
    awareness.setLocalStateField("user", {
      ...currentState,
      id: user?.id || user?._id || user?.email,
      email: user?.email,
      name: user?.name || currentState.name || "User",
      role,
      color: "#6366f1",
    });
  }, [role, user?.email, user?.id, user?._id, user?.name]);

  /* ------------------ SOCKET.IO REAL-TIME EVENTS ------------------ */
  useEffect(() => {
    if (!documentId || isNewDocument) return;

    socket.emit("join-document", {
      documentId,
      user: {
        id: user?.id || user?._id || user?.email,
        name: user?.name,
        role,
        email: user?.email,
      },
    });

    const handlePresence = (users) => {
      setPresence(users || []);
    };

    const handleTitleUpdate = ({ title: newTitle }) => {
      if (lastTitleRef.current !== newTitle && lastTitleRef.current !== "Untitled Document") {
        toast(`Title changed to "${newTitle}"`, { icon: "📝" });
      } else if (lastTitleRef.current === "Untitled Document" && newTitle) {
        toast(`Title set to "${newTitle}"`, { icon: "📝" });
      }
      lastTitleRef.current = newTitle;
      setTitle(newTitle);
    };

    const handleCollaboratorsUpdate = ({ collaborators }) => {
      toast("Access list updated", { icon: "👥" });
      
      setCollaborators(
        (collaborators || []).map((entry) => ({
          key: entry?.user?._id || entry?.user || `${entry?.role}`,
          name: entry?.user?.name || entry?.user?.email || "Collaborator",
          role: entry?.role || "viewer",
        }))
      );

      // Also dynamically update current user's role if it was changed
      const currentUserId = user?.id || user?._id || user?.email;
      const myEntry = (collaborators || []).find(
        (c) => (c.user?._id || c.user || c.email) === currentUserId
      );
      
      if (myEntry && role !== myEntry.role && role !== "owner") {
        toast.success(`Your role changed to ${myEntry.role}`);
        setRole(myEntry.role);
      }
    };

    const handleDocumentDeleted = () => {
      Swal.fire(
        "Document Deleted",
        "The owner deleted this document.",
        "warning"
      ).then(() => {
        navigate("/", { replace: true });
      });
    };

    socket.on("presence-update", handlePresence);
    socket.on("title-updated", handleTitleUpdate);
    socket.on("collaborators-updated", handleCollaboratorsUpdate);
    socket.on("document-deleted", handleDocumentDeleted);

    return () => {
      socket.emit("leave-document", documentId);
      socket.off("presence-update", handlePresence);
      socket.off("title-updated", handleTitleUpdate);
      socket.off("collaborators-updated", handleCollaboratorsUpdate);
      socket.off("document-deleted", handleDocumentDeleted);
      setPresence([]);
    };
  }, [documentId, isNewDocument, user, role, navigate]);

  /* ------------------ ROLE CHANGE ------------------ */
  useEffect(() => {
    if (!quillRef.current) return;

    const canEdit = role === "owner" || role === "editor";
    quillRef.current.enable(canEdit);
  }, [role]);

  /* ------------------ SAVE ------------------ */
  const handleManualSave = async () => {
    if (!ydocRef.current) return;

    try {
      setIsSaving(true);

      const state = Y.encodeStateAsUpdate(ydocRef.current);

      if (isNewDocument) {
        const { data } = await api.post("/documents", { title });

        await api.patch(`/documents/${data.document.id}`, {
          contentYjs: Array.from(state),
        });

        navigate(`/editor/${data.document.id}`, { replace: true });
        toast.success("Document created & saved");
        return;
      }

      await api.patch(`/documents/${documentId}`, {
        title,
        contentYjs: Array.from(state),
      });

      toast.success("Document saved");
    } catch {
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  /* ------------------ TITLE SAVE ------------------ */
  const handleTitleBlur = async () => {
    if (!documentId || isNewDocument) return;

    try {
      await api.patch(`/documents/${documentId}`, { title });
    } catch {
      toast.error("Failed to save title");
    }
  };

  /* ------------------ SHARE ------------------ */
  const handleShareSubmit = async (e) => {
    e.preventDefault();

    if (role !== "owner" || isNewDocument) return;

    try {
      setShareLoading(true);

      await api.post(`/documents/${documentId}/share`, {
        email: shareEmail,
        role: shareRole,
      });

      setShareEmail("");
      toast.success("Access updated");
    } catch {
      toast.error("Failed to share");
    } finally {
      setShareLoading(false);
    }
  };

  const handleBackToDocuments = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#e9eaee]">
      <EditorView
        title={title}
        onTitleChange={setTitle}
        onTitleBlur={handleTitleBlur}
        onManualSave={handleManualSave}
        onBackToDocuments={handleBackToDocuments}
        isSaving={isSaving}
        role={role}
        collaborators={collaborators || []}
        readOnly={role === "viewer"}
        canShare={role === "owner"}
        isDraft={isNewDocument}
        shareEmail={shareEmail}
        onShareEmailChange={setShareEmail}
        shareRole={shareRole}
        onShareRoleChange={setShareRole}
        onShareSubmit={handleShareSubmit}
        shareLoading={shareLoading}
        loading={loading}
        presence={presence}
      />

      <section className="mx-auto w-full max-w-5xl px-4 pb-12">
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f7f7fb_100%)] shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
          <Toolbar />
          <div ref={editorRef} className="min-h-105" />
        </div>
      </section>
    </div>
  );
}
