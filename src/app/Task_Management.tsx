"use client";
import "./Task_Management.css";
import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  types,
  Instance,
  getSnapshot,
  flow,
  onSnapshot,
  applySnapshot,
} from "mobx-state-tree";
import Image from "next/image";
import { number } from "mobx-state-tree/dist/internal";

// Define the Task model
const TaskModel = types.model("Task", {
  id: types.number,
  title: types.string,
  description: types.string,
  status: types.string,
});

// Define the TaskStore model
const TaskStoreModel = types
  .model("TaskStore", {
    tasks: types.array(TaskModel),
  })
  .actions((self) => ({
    addTask(task: any) {
      self.tasks.push(task);
    },
    updateTask(updatedTask: any) {
      const index = self.tasks.findIndex((task) => task.id === updatedTask.id);
      if (index !== -1) {
        self.tasks[index] = updatedTask;
      }
    },
    deleteTask(taskId: number) {
      const index = self.tasks.findIndex((task) => task.id === taskId);
      if (index !== -1) {
        self.tasks.splice(index, 1);
      }
    },
  }));

// Create an instance of the TaskStore
const taskStore = TaskStoreModel.create({
  tasks: [],
});

const playAnimationIntialData = {
  play: false,
  type: "",
};
const TaskManagementApp: React.FC = observer(() => {
  const [currentTaskId, setCurrentTaskId] = useState<number>();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [playAnimation, setPlayAnimation] = useState(playAnimationIntialData);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("incomplete");

  useEffect(() => {
    const tasksData = localStorage.getItem("tasks");
    if (tasksData) {
      const snapshot = JSON.parse(tasksData);
      applySnapshot(taskStore, snapshot);
    }

    const disposer = onSnapshot(taskStore, (snapshot) => {
      localStorage.setItem("tasks", JSON.stringify(snapshot));
    });

    return () => disposer();
  }, [taskStore.tasks]);

  const handleAddTask = () => {
    setPlayAnimation({ play: true, type: "handleAddTask" });
    let newTaskId = taskStore.tasks.length + 1;

    const newTask = TaskModel.create({
      id: newTaskId,
      title,
      description,
      status,
    });

    setTimeout(() => {
      setPlayAnimation({ play: true, type: "toggle" });
    }, 1000);
    taskStore.addTask(newTask);
    resetForm();
  };

  const handleEditTask = (taskId: number) => {
    setCurrentTaskId(taskId);

    setTimeout(() => {
      setIsFormVisible(true);
    }, 0);

    const task = getTaskById(taskId);
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    }
  };

  const handleUpdateTask = (task: any) => {
    setPlayAnimation({ play: true, type: "handleUpdateTask" });

    if (currentTaskId) {
      let updatedTask = {
        id: currentTaskId,
        title,
        description,
        status,
      };

      taskStore.updateTask(updatedTask);
    } else {
      let status = task.status == "incomplete" ? "complete" : "incomplete";
      let updateTask = {
        ...task,
        status,
      };

      setTimeout(() => {
        setPlayAnimation(playAnimationIntialData);
        taskStore.updateTask(updateTask);
      }, 300);
    }

    HandleFormVisibility();
  };

  const handleDeleteTask = (taskId: number) => {
    setPlayAnimation({ play: true, type: "handleDeleteTask" });
    setTimeout(() => {
      taskStore.deleteTask(taskId);
      setPlayAnimation(playAnimationIntialData);
    }, 300);
  };

  const getTaskById = (taskId: number) => {
    return taskStore.tasks.find((task) => task.id === taskId);
  };

  const HandleFormVisibility = () => {
    setIsFormVisible(false);

    setTimeout(() => {
      setCurrentTaskId(undefined);

      resetForm();
    }, 400);
  };

  const resetForm = () => {
    setCurrentTaskId(undefined);
    setTitle("");
    setDescription("");
    setStatus("incomplete");
  };

  return (
    <div className={`rounded-md m-4`}>
      <div className={`mb-4 text-center `}>
        <h1 className="text-3xl font-bold ">Pro Tasker</h1>
      </div>

      <div
        className={`mb-2 border shadow-md  rounded-xl p-2  sticky  top-0 backdrop-blur-sm bg-white/20 `}
      >
        <h2 className="text-xl font-bold text-center m-2">Add Task</h2>
        <form
          className=" text-gray-400  m-4 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 p-2 rounded-md mb-2"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 p-2 rounded-md mb-2"
            required
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 p-2 rounded-md mb-2"
            required
          >
            <option value="incomplete">Incomplete</option>
            <option value="complete">Complete</option>
          </select>
          <div
            className={`rotate-0 text-center flip-card transition-transform transform ${
              playAnimation.type == "handleAddTask" && `flip`
            } `}
          >
            {playAnimation.type !== "handleAddTask" && (
              <button
                className={` ${`flip-front`} border transition delay-150 hover:bg-blue-400 rounded-full text-white px-4 py-2 shadow-md`}
                type="submit"
              >
                Add Task
              </button>
            )}

            {playAnimation.type == "handleAddTask" && (
              <button
                className={` ${`flip-back`} border transition delay-150  rounded-full text-white px-4 py-2 shadow-md bg-green-500`}
              >
                Added
              </button>
            )}
          </div>
        </form>
      </div>

      <ul className="grid grid-cols-1  my-4 gap-4 sm:grid-cols-2">
        {taskStore.tasks.map((task) => (
          <li
            key={task.id}
            className={`border align-center border-gray-300 rounded-md  shadow-md  p-2 bg-white/20 transition-all ${
              playAnimation.type == "handleDeleteTask"
                ? " hover:ring-8 ring-red-500"
                : ""
            }`}
          >
            <div className="text-center lg:flex  flex-row items-center  justify-evenly h-full ">

              <div className="w-full flex justify-center ">
                <Image
                  loading="lazy"
                  className={`hover:cursor-pointer rounded-full  bg-slate-100 shadow-md transition cursor-pointer ${
                    playAnimation.type == "Update" ||
                    (playAnimation.type == "handleUpdateTask" &&
                      `hover:rotate-180`)
                  }`}
                  onClick={() => handleUpdateTask(task)}
                  width={40}
                  height={40}
                  src={
                    task.status == "complete"
                      ? "./completed.svg"
                      : "./incomplete.svg"
                  }
                  alt="Incomplete logo"
                />
              </div>
              <div className="w-full m-2">
                <h3 className="text-lg font-bold">{task.title}</h3>
              </div>
              <div className="w-full m-2">
                <p >{task.description}</p>
              </div>

              {/* { Action buttons } */}
              <div className="w-full  p-0 m-0 flex justify-evenly">
            

                <div className="w-full flex justify-center  rounded-md ">
                  <Image
                    className="hover:cursor-pointer"
                    width={40}
                    height={40}
                    onClick={() => handleEditTask(task.id)}
                    src="/edit-icon.svg"
                    alt="edit"
                  />
                </div>
                <div className="w-full flex justify-center ">
                  <Image
                    onClick={() => handleDeleteTask(task.id)}
                    className="hover:cursor-pointer "
                    width={40}
                    height={40}
                    src={"./delete-icon.svg"}
                    alt="Incomplete logo"
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {currentTaskId && (
        <div
          className={`
          fixed
       
         text-gray-400
          backdrop-brightness-90
          sm:border-0
          grid justify-center 
          
          
           h-screen top-0 left-0
            right-0  rounded-lg 
              align-middle items-center 
              border
               transition ease-in-out 
               delay-150   
              
               ${`${
                 !isFormVisible ? `${`backdrop-blur-0`}` : `backdrop-blur-lg`
               }`}         
                duration-300 `}
        >
          <div
            className={`border rounded-md shadow-xl p-4 align-middle backdrop-blur-xl sm:w-full   bg-white/20  `}
          >
            <div className="flex justify-end align-bottom ">
              <button
                className="p-2 rounded-full shadow-md  text-white bg-red-600"
                onClick={() => HandleFormVisibility()}
              >
                Close
              </button>
            </div>
            <h2 className="text-xl font-bold text-center text-white p-2 m-2">
              Edit Task
            </h2>
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTask(currentTaskId);
              }}
            >
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border border-gray-300 p-2 rounded-md mb-2"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray-300 p-2 rounded-md mb-2"
                required
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 p-2 rounded-md mb-2"
                required
              >
                <option value="incomplete">Incomplete</option>
                <option value="complete">Complete</option>
              </select>
              <button
                className="transition hover:bg-blue-500 border text-white px-4 py-2 rounded-md"
                type="submit"
              >
                Update Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default TaskManagementApp;
export { taskStore };
