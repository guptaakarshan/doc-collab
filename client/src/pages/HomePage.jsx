import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

export default function HomePage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true);
        const { data } = await api.get("/documents");
        setDocuments(data.documents || []);
      } catch {
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  const handleCreateDocument = () => {
    navigate("/editor/new");
  };

  const handleOpenDocument = (id) => {
    navigate(`/editor/${id}`);
  };

  const handleDeleteDocument = async (doc) => {
    const result = await Swal.fire({
      title: "Delete document?",
      text: `"${doc.title}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    await api.delete(`/documents/${doc.id}`);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    toast.success("Deleted");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5f5f7] to-[#e9ebef] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* HERO */}
        <h1 className="text-3xl font-semibold text-[#030213]">
          Collaborative Documents
        </h1>
        <p className="mt-2 text-[#717182]">
          Create a document, open it in the editor, and collaborate in real
          time.
        </p>

        {/* HEADER ROW */}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#030213]">
            Your Documents
          </h2>

          <button
            onClick={handleCreateDocument}
            className="rounded-xl bg-[#030213] px-5 py-2 text-white shadow transition active:scale-95"
          >
            New Document
          </button>
        </div>

        {/* CONTENT */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p>Loading...</p>
          ) : documents.length === 0 ? (
            /* EMPTY STATE */
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                📄
              </div>
              <h3 className="text-lg font-semibold text-[#030213]">
                No documents yet
              </h3>
              <p className="mt-2 text-[#717182]">
                Create your first document to get started.
              </p>
              <button
                onClick={handleCreateDocument}
                className="mt-4 rounded-xl bg-[#030213] px-5 py-2 text-white"
              >
                Create Document
              </button>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {/* TITLE */}
                <h3 className="text-lg font-semibold text-[#030213]">
                  {doc.title}
                </h3>

                {/* ROLE BADGE */}
                <span className="mt-2 inline-block rounded-full bg-[#f3f3f5] px-3 py-1 text-xs text-[#717182]">
                  {doc.role}
                </span>

                {/* DATE */}
                <p className="mt-3 text-sm text-[#717182]">
                  Updated: {new Date(doc.updatedAt).toLocaleString()}
                </p>

                {/* ACTIONS */}
                <div className="mt-4 flex items-center gap-3">
                  {/* Open Button */}
                  <button
                    onClick={() => handleOpenDocument(doc.id)}
                    className="flex-1 rounded-xl bg-[#030213] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
                  >
                    Open
                  </button>

                  {/* Delete Button */}
                  {doc.role?.toUpperCase() === "OWNER" && (
                    <button
                      onClick={() => handleDeleteDocument(doc)}
                      className="rounded-xl border border-[#d4183d] px-4 py-2 text-sm font-medium text-[#d4183d] transition hover:bg-red-50 active:scale-[0.98]"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
