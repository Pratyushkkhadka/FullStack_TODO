import { useState, useEffect } from "react";

export default function NoteForm({ onSubmit, initialData }) {
  const [note, setNote] = useState({
    title: "",
    content: "",
    dueDate: "",
    isArchived: false,
  });

  useEffect(() => {
    if (initialData) {
      setNote(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNote((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(note);
    setNote({ title: "", content: "", dueDate: "", isArchived: false });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "10px" }}>
      <input
        name="title"
        value={note.title}
        onChange={handleChange}
        placeholder="Note Title"
        required
      />
      <textarea
        name="content"
        value={note.content}
        onChange={handleChange}
        placeholder="Write note content here..."
        rows="3"
        required
      />
      <input
        type="date"
        name="dueDate"
        value={note.dueDate ? note.dueDate.substring(0, 10) : ""}
        onChange={handleChange}
      />
      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
        <input
          type="checkbox"
          name="isArchived"
          checked={note.isArchived}
          onChange={handleChange}
          style={{ width: "auto" }}
        />
        Archive immediately
      </label>
      <button type="submit">Save Note</button>
    </form>
  );
}