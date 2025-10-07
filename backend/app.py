from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from enum import Enum
from uuid import uuid4
import random 

# Para ejecutar: uvicorn app:server --reload --port 3001

server = FastAPI()

# Permitir conexión desde el frontend
server.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tipos de estados permitidos para las tareas
class StatusEnum(str, Enum):
    todo = "To Do"
    doing = "Doing"
    done = "Done"

# Modelo de datos
class Task(BaseModel):
    id: int | None = None
    title: str
    status: StatusEnum

# Para actualizar una tarea, pero con campos opcionales
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[StatusEnum] = None

# Lista incicial por defecto
tasks = [Task(id=1, title="Tarea de prueba", status="To Do")]

# Obtener las tareas
@server.get("/tasks")
def get_tasks():
    return tasks

# Crear una tarea
@server.post("/tasks", status_code=201) # 201 – Created
def create_task(task: Task):
    if not task.title or not task.status:
        raise HTTPException(status_code=400, detail="El título y estado son obligatorios.")
    
    task.id = random.randrange(100000, 1000000)
    tasks.append(task)
    return task

# Actualizar una tarea (también funciona pasando solo title o status)
@server.put("/tasks/{task_id}")
def update_task(task_id: int, updated_task: TaskUpdate):
    for t in tasks:
        if t.id == task_id:
            if updated_task.title is not None:
                t.title = updated_task.title
            if updated_task.status is not None:
                t.status = updated_task.status
            return {"message": "Tarea actualizada", "task": t}
    raise HTTPException(status_code=404, detail=f"Tarea con id {task_id} no encontrada.")


# Eliminar una tarea
@server.delete("/tasks/{task_id}", status_code=204) # 204 – No Content
def delete_task(task_id: int):
    global tasks
    for t in tasks:
        if t.id == task_id:
            tasks = [t for t in tasks if t.id != task_id]
            return
    raise HTTPException(status_code=404, detail=f"Tarea con id {task_id} no encontrada.")
