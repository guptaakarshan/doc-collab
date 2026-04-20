import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const EMPTY_DELTA = { ops: [{ insert: "\n" }] };

export default function useCollabEditor({
  documentId,
  initialDelta,
  role,
  user,
}) {
  const [value, setValue] = useState(initialDelta || EMPTY_DELTA);
  const [presence, setPresence] = useState([]);
  const [socketError, setSocketError] = useState("");
  const [permissionChange, setPermissionChange] = useState(null);
  const [titleChange, setTitleChange] = useState(null);
  const [documentDeleted, setDocumentDeleted] = useState(null);
  const socketRef = useRef(null);

  const canEdit = role === "owner" || role === "editor";
  const isDraftDocument = documentId === "new";

  useEffect(() => {
    setValue(initialDelta || EMPTY_DELTA);
  }, [initialDelta, documentId]);

  useEffect(() => {
    if (!documentId || isDraftDocument) return undefined;

    const token = localStorage.getItem("collab_token");
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth: { token },
      },
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketError("");
      socket.emit("document:join", {
        documentId,
        userName: user?.name,
        userEmail: user?.email,
      });
    });

    // Initial snapshot from server after joining the room.
    socket.on("document:load", (payload) => {
      if (payload?.documentId !== documentId) return;
      setValue(payload.contentDelta || EMPTY_DELTA);
    });

    // Apply remote updates pushed by other users in the room.
    socket.on("document:remote-update", (payload) => {
      if (payload?.documentId !== documentId) return;
      setValue(payload.delta || EMPTY_DELTA);
    });

    socket.on("document:presence", (participants) => {
      const deduped = [];
      const seenUsers = new Set();

      for (const person of participants || []) {
        const uniqueKey = person?.userId || person?.socketId;
        if (!uniqueKey || seenUsers.has(uniqueKey)) continue;
        seenUsers.add(uniqueKey);
        deduped.push(person);
      }

      setPresence(deduped);
    });

    socket.on("document:permission-changed", (payload) => {
      if (payload?.documentId !== documentId) return;
      if (payload?.targetUserId !== user?.id) return;

      setPresence((prev) =>
        prev.map((person) =>
          person.userId === payload.targetUserId
            ? {
                ...person,
                role: payload.newRole,
              }
            : person,
        ),
      );
      setPermissionChange(payload);
    });

    socket.on("document:title-updated", (payload) => {
      if (payload?.documentId !== documentId) return;
      setTitleChange(payload);
    });

    socket.on("document:deleted", (payload) => {
      if (payload?.documentId !== documentId) return;
      setDocumentDeleted(payload);
    });

    socket.on("document:error", (payload) => {
      setSocketError(payload?.message || "Socket error while joining document");
    });

    socket.on("connect_error", (error) => {
      setSocketError(error?.message || "Socket connection failed");
    });

    return () => {
      socket.emit("document:leave");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [documentId, isDraftDocument, user?.email, user?.id, user?.name]);

  const handleEditorChange = useCallback(
    (content, delta, source, editor) => {
      if (source !== "user") return;
      if (!canEdit) return;

      const snapshotDelta = editor.getContents();
      const snapshotHtml = editor.getHTML();

      setValue(snapshotDelta);
      socketRef.current?.emit("document:sync", {
        documentId,
        delta: snapshotDelta,
        html: snapshotHtml,
      });
    },
    [canEdit, documentId],
  );

  return {
    value,
    setValue,
    presence,
    socketError,
    permissionChange,
    setPermissionChange,
    titleChange,
    setTitleChange,
    documentDeleted,
    setDocumentDeleted,
    handleEditorChange,
    canEdit,
  };
}
