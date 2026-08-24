import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import apiClient from "../Api/ApiClient";

export default function Dashboard() {
  const { logout } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [newTodo, setNewTodo] = useState({ title: "", description: "", dueDate: "", priority: "Medium" });
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: "", description: "", dueDate: "", priority: "Medium" });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await apiClient.get("/notes");
      if (Array.isArray(res.data)) {
        const formatted = res.data.map((item) => ({
          ...item,
          _id: item._id || item.id || Date.now().toString(),
          content: item.content || item.description || "",
          isCompleted: Boolean(item.isCompleted || item.completed),
        }));
        setTodos(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch todos:", err);
    }
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    setLoading(true);
    try {
      const payload = {
        title: newTodo.title,
        content: newTodo.description,
        dueDate: newTodo.dueDate || null,
        priority: newTodo.priority,
      };

      const res = await apiClient.post("/notes", payload);

      if (res.data) {
        const createdTask = {
          ...res.data,
          _id: res.data._id || res.data.id || Date.now().toString(),
          content: res.data.content || newTodo.description,
          isCompleted: Boolean(res.data.isCompleted || res.data.completed || false),
        };

        // Add directly to top of UI array
        setTodos((prev) => [createdTask, ...prev]);

        // Reset filter tab to 'all' so new item isn't filtered out
        setFilter("all");
      }

      setNewTodo({ title: "", description: "", dueDate: "", priority: "Medium" });
    } catch (err) {
      console.error("Failed to create todo:", err);
      // Fallback: re-fetch from database if local append failed
      await fetchTodos();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (todo) => {
    const nextStatus = !Boolean(todo.isCompleted || todo.completed);

    setTodos((prev) =>
      prev.map((t) =>
        t._id === todo._id ? { ...t, isCompleted: nextStatus, completed: nextStatus } : t
      )
    );

    try {
      const payload = {
        title: todo.title,
        content: todo.content || "",
        dueDate: todo.dueDate,
        priority: todo.priority,
        isCompleted: nextStatus,
        completed: nextStatus,
      };
      await apiClient.put(`/notes/${todo._id}`, payload);
    } catch (err) {
      console.error("Failed to update status on server:", err);
      fetchTodos();
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await apiClient.delete(`/notes/${id}`);
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleStartEdit = (todo) => {
    setEditingId(todo._id);
    const formattedDate = todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : "";
    setEditFormData({
      title: todo.title,
      description: todo.content || "",
      dueDate: formattedDate,
      priority: todo.priority || "Medium",
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const payload = {
        title: editFormData.title,
        content: editFormData.description,
        dueDate: editFormData.dueDate,
        priority: editFormData.priority,
      };
      const res = await apiClient.put(`/notes/${id}`, payload);

      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id
            ? {
                ...res.data,
                _id: res.data._id || id,
                content: res.data.content || editFormData.description,
                isCompleted: Boolean(res.data.isCompleted || res.data.completed),
              }
            : todo
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    const isDone = Boolean(todo.isCompleted || todo.completed);
    if (filter === "pending") return !isDone;
    if (filter === "completed") return isDone;
    return true;
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="navbar">
        <div className="brand-logo">
          <div className="logo-icon">✓</div>
          <h2>Task Manager</h2>
        </div>
        <button onClick={logout} className="btn-logout">Logout</button>
      </header>

      {/* Task Form Panel */}
      <div className="glass-panel form-card">
        <div className="form-header">
          <h3>Create New Task</h3>
          <p>Organize your day with structured dates and priority levels.</p>
        </div>

        <form onSubmit={handleCreateTodo} className="form-group">
          <div className="input-block">
            <label>Task Title</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g., Complete Assignment..."
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              required
            />
          </div>

          <div className="input-block">
            <label>Description & Sub-notes</label>
            <textarea
              className="textarea-field"
              placeholder="Add extra context or details here..."
              rows={2}
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="input-block">
              <label>Due Date</label>
              <input
                className="input-field date-input"
                type="date"
                value={newTodo.dueDate}
                onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
              />
            </div>

            <div className="input-block">
              <label>Priority</label>
              <select
                className="input-field select-input"
                value={newTodo.priority}
                onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Adding Task..." : "+ Add Task"}
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Tasks <span>{todos.length}</span>
        </button>
        <button
          className={`tab-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending <span>{todos.filter((t) => !(t.isCompleted || t.completed)).length}</span>
        </button>
        <button
          className={`tab-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed <span>{todos.filter((t) => t.isCompleted || t.completed).length}</span>
        </button>
      </div>

      {/* Task Grid */}
      <div className="notes-grid">
        {filteredTodos.map((todo) => {
          const isEditing = editingId === todo._id;
          const isDone = Boolean(todo.isCompleted || todo.completed);

          return (
            <div key={todo._id} className={`glass-panel note-card ${isDone ? "completed-card" : ""}`}>
              {isEditing ? (
                <div className="form-group edit-form">
                  <input
                    className="input-field"
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                  />
                  <textarea
                    className="textarea-field"
                    rows={2}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                  <div className="form-row">
                    <input
                      className="input-field date-input"
                      type="date"
                      value={editFormData.dueDate}
                      onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                    />
                    <select
                      className="input-field select-input"
                      value={editFormData.priority}
                      onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="edit-btn-row">
                    <button onClick={() => handleSaveEdit(todo._id)} className="btn-action btn-complete">Save</button>
                    <button onClick={() => setEditingId(null)} className="btn-action btn-edit">Cancel</button>
                  </div>
                </div>
              ) : isDone ? (
                /* Completed State View */
                <div className="completed-box-container">
                  <div className="completed-center-content">
                    <h3 className="strike-title">{todo.title}</h3>
                    <span className="completed-badge">✓ COMPLETED</span>
                  </div>
                  <div className="completed-footer-single">
                    <button onClick={() => handleToggleComplete(todo)} className="btn-single-undo">
                      ↺ Undo Task
                    </button>
                  </div>
                </div>
              ) : (
                /* Pending State View */
                <div className="card-inner-layout">
                  <div className="card-main-content">
                    <div className="card-header-row">
                      <h3 className="task-title">{todo.title}</h3>
                      <span className={`priority-badge priority-${(todo.priority || "Medium").toLowerCase()}`}>
                        {todo.priority || "Medium"}
                      </span>
                    </div>
                    {todo.content && <p className="task-description">{todo.content}</p>}
                  </div>

                  <div className="card-footer">
                    <div className="date-chip">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {todo.dueDate
                        ? new Date(todo.dueDate).toLocaleDateString("en-GB")
                        : "No date"}
                    </div>

                    <div className="action-buttons-group">
                      <button onClick={() => handleStartEdit(todo)} className="btn-action btn-edit" title="Edit">
                        Edit
                      </button>
                      <button onClick={() => handleToggleComplete(todo)} className="btn-action btn-complete" title="Complete">
                        ✓ Done
                      </button>
                      <button onClick={() => handleDeleteTodo(todo._id)} className="btn-action btn-delete" title="Delete">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}