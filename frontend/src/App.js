import { useEffect, useState } from "react";

// Por defecto, Frontend en http://localhost:3000
 
const API_URL = "http://localhost:3001/tasks"; // URL Backend
const columnas = ["To Do", "Doing", "Done"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  // Carga inicial de tareas
  useEffect(() => {
    fetch(API_URL).then(resp => resp.json()).then(setTasks);
  }, []);

  // Crea una tarea en la columnas To Do
  const crea_tarea = async () => {

    const tituloLimpio = title.trim();

    if (!tituloLimpio) {
      alert("El título no puede estar vacío");
      return;
    }

    // Validar si ya existe una tarea con el mismo nombre 
    const duplicada = tasks.some(
      t => t.title === tituloLimpio
    );

    if (duplicada) {
      alert("Ya existe una tarea con ese nombre");
      return;
    }

    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, status: "To Do" })
      });

      // Si no hay errores, actualiza la lista
      if (resp.ok) {
        const new_task = await resp.json();
        setTasks([...tasks, new_task]);
        setTitle("");
      } else {
        console.error("Error al crear la tarea"); // Para respuestas HTTP de error
      }
    } catch (error) {
      console.error("Error de red al crear la tarea:", error); // Y errores de red 
    }
  };

  // Cambia de columna una tarea al cambiar el estado
  const mueve_tarea = async (id, newStatus) => {
    try {
      const resp = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      // Actualización de lista de tareas
      if (resp.ok) {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
      } else {
        console.error("Error al mover la tarea"); 
      }
    } catch (error) {
      console.error("Error al mover la tarea:", error); 
    }
  };

  // Edita el título de una tarea
  const edita_tarea = async (id, nuevoTitulo) => {
    const tarea = tasks.find(t => t.id === id);
    if (!tarea) return; // Si no hay una tarea con este ID no hace nada

    // Copia de la tarea pero con título nuevo
    const tareaEditada = { ...tarea, title: nuevoTitulo };

    try {
      const resp = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tareaEditada)
      });

      // Actualización de lista de tareas
      if (resp.ok) {
        setTasks(tasks.map(t => (t.id === id ? tareaEditada : t)));
      } else {
        console.error("Error al editar la tarea");
      }
    } catch (error) {
      console.error("Error de red al editar la tarea:", error);
    }
  };

  // Borra una tarea
  const borra_tarea = async (id) => {
    try {
      const resp = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      
      // Actualización de lista de tareas
      if (resp.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      } else {
        console.error("Error al borrar la tarea");
      }
    } catch (error) {
      console.error("Error de red al borrar la tarea:", error);
    }
  };

  return (
    <div>
      {/* Kanban */}
      <div className="kanban-container">
        {columnas.map(col => (
          <div key={col} className="column">
            <div className="column-header">{col}</div>

            {tasks
              .filter(t => t.status === col)
              .map(t => (
                <div key={t.id} className="task">
                  {/* ID */}
                  <span style={{ fontSize: '12px', color: '#555' }}>#{t.id}</span>
                  <p>{t.title}</p>
                </div>
              ))}

            {col === "To Do" && (
              <div className="add-task">
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Nueva tarea"
                />
                <button onClick={crea_tarea}>Agregar</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/*Barra inferior*/}
      <div className="bottom-bar">
        {/* EDITAR */}
        <button
          className="edit"
          onClick={() => {
            const id = prompt("ID de la tarea a editar:");
            if (!id) return;
            const tarea = tasks.find(t => t.id === parseInt(id));
            if (!tarea) return alert("No existe una tarea con ese ID");

            const nuevoTitulo = prompt("Nuevo título:", tarea.title);
            if (!nuevoTitulo) return;

            edita_tarea(tarea.id, nuevoTitulo.trim());
          }}
        >
         Editar
        </button>

        {/*MOVER*/}
        <button
          className="move"
          onClick={() => {
            const id = prompt("ID de la tarea a mover:");
            if (!id) return;
            const tarea = tasks.find(t => t.id === parseInt(id));
            if (!tarea) return alert("No existe una tarea con ese ID");

            const nuevoEstado = prompt(`Nuevo estado (${columnas.join(", ")}):`, tarea.status);
            if (!nuevoEstado || !columnas.includes(nuevoEstado)) {
              return alert("Estado no válido");
            }

            mueve_tarea(tarea.id, nuevoEstado);
          }}
        >
          Mover
        </button>

        {/* BORRAR */}
        <button
          className="delete"
          onClick={() => {
            const id = prompt("ID de la tarea a borrar:");
            if (!id) return;
            const tarea = tasks.find(t => t.id === parseInt(id));
            if (!tarea) return alert("No existe una tarea con ese ID");

            if (window.confirm(`¿Borrar "${tarea.title}"?`)) {
              borra_tarea(tarea.id);
            }
          }}
        >
          Borrar
        </button>
      </div>
    </div>
  );
}

