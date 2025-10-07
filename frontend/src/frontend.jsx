import { useEffect, useState } from "react";

// Por defecto, Frontend en http://localhost:3000
// npm start

const API_URL = "http://localhost:3001/tasks"; // URL Backend
const columnas = ["To Do", "Doing", "Done"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [draggingTask, setDraggingTask] = useState(null);

  // Carga inicial de tareas
  useEffect(() => {
    fetch(API_URL).then(resp => resp.json()).then(setTasks);
  }, []);

  // Crea una tarea en la columnas To Do
  const crea_tarea = async () => {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status: "To Do" })
    });

    // Si no hay errores actualiza la lista
    if (resp.ok) {
      const new_task = await resp.json();
      setTasks([...tasks, new_task]);
      setTitle("");
    } else {
      console.error("Error al crear la tarea");
    }
  };

  // Cambia de columna una tarea al cambiar el estado
  const mueve_tarea = async (id, newStatus) => {
  try {
    // Encuentra la tarea
    const tarea = tasks.find(t => t.id === id);
    if (!tarea) return;

    const resp = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({id: tarea.id, title: tarea.title, status: newStatus })
    });

    // Si no hay errores actualiza la lista
    if (resp.ok) {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } else {
      console.error("Error al mover la tarea"); // Error de respuesta
    }
  } catch (error) {
    console.error("Error al mover la tarea:", error); // Error de red
  }
  };

  // Edita el título de una tarea
  const edita_tarea = async (id, nuevoTitulo) => {
    const tarea = tasks.find(t => t.id === id);
    if (!tarea) return;

    // Crear una copia con el nuevo título
    const tareaEditada = { ...tarea, title: nuevoTitulo };

    const resp = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tareaEditada)
    });

    // Si no hay errores actualiza la lista
    if (resp.ok) {
      setTasks(tasks.map(t => (t.id === id ? tareaEditada : t)));
    } else {
      console.error("Error al editar");
    }
  };

  // Borra una tarea
  const borra_tarea = async (id) => {
    const resp = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

    // Si no hay errores actualiza la lista
    if (resp.ok) {
      setTasks(tasks.filter(t => t.id !== id));
    } else {
      console.error("Error al borrar la tarea");
    }
  };

    return (
    <div className="kanban-container" style={{ display: "flex", gap: "20px" }}>
      {["To Do", "Doing", "Done"].map((col) => (
        <div
          key={col}
          className="column"
          style={{
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "10px",
            flex: 1,
            minHeight: "300px",
          }}
          onDragOver={(e) => e.preventDefault()} // permite drop
          onDrop={(e) => {
            const taskId = e.dataTransfer.getData("text/plain");
            if (!taskId) return;
            console.log(`✅ Soltaste la tarea ${taskId} en columna ${col}`);
          }}
        >
          <h2 style={{ textAlign: "center" }}>{col}</h2>

          {tasks
            .filter((t) => t.status === col)
            .map((t) => (
              <div
                key={t.id}
                className="task"
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", t.id);
                  console.log(`🟢 Empezando a arrastrar: ${t.title}`);
                }}
                style={{
                  backgroundColor: "#e0e0e0",
                  padding: "10px",
                  margin: "10px 0",
                  borderRadius: "6px",
                  cursor: "grab",
                  textAlign: "center",
                }}
              >
                {t.title}
              </div>
            ))}
        </div>
      ))}
    </div>
  );

}
