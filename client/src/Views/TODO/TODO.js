import { useEffect, useState } from 'react';
import Styles from './TODO.module.css';
import { dummy } from './dummy';
import axios from 'axios';

export function TODO(props) {

  const [newTodo, setNewTodo] = useState('');
  const [todoData, setTodoData] = useState(dummy);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // State to track editing mode
  const [currentTodo, setCurrentTodo] = useState({}); // State to store currently edited todo

  useEffect(() => {
    const fetchTodo = async () => {
      const apiData = await getTodo();
      setTodoData(apiData);
      setLoading(false);
    };
    fetchTodo();
  }, []);

  const getTodo = async () => {
    const options = {
      method: "GET",
      url: `http://localhost:8000/api/todo`,
      headers: {
        accept: "application/json",
      }
    };
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (err) {
      console.log(err);
      return []; // return an empty array in case of error
    }
  };

  const addTodo = () => {
    const options = {
      method: "POST",
      url: `http://localhost:8000/api/todo`,
      headers: {
        accept: "application/json",
      },
      data: {
        title: newTodo
      }
    };
    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        setTodoData(prevData => [...prevData, response.data.newTodo]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteTodo = (id) => {
    const options = {
      method: "DELETE",
      url: `http://localhost:8000/api/todo/${id}`,
      headers: {
        accept: "application/json",
      }
    };
    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        setTodoData(prevData => prevData.filter(todo => todo._id !== id));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateTodo = async (id) => {
    const updatedTodo = { ...currentTodo, title: currentTodo.title }; // Create copy to avoid mutation
    const options = {
      method: "PATCH",
      url: `http://localhost:8000/api/todo/${id}`,
      headers: {
        accept: "application/json",
      },
      data: updatedTodo
    };
    try {
      const response = await axios.request(options);
      console.log(response.data);
      setTodoData(prevData => prevData.map(todo => todo._id === id ? response.data : todo));
      setIsEditing(false); // Exit editing mode after successful update
      setCurrentTodo({}); // Reset currentTodo state
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditClick = (todo) => {
    setIsEditing(true);
    setCurrentTodo(todo); // Set the todo to be edited
  };

  return (
    <div className={Styles.ancestorContainer}>
      <div className={Styles.headerContainer}>
        <h1>
          Tasks
        </h1>
        <span>
          <input
            className={Styles.todoInput}
            type='text'
            name='New Todo'
            value={newTodo}
            onChange={(event) => {
              setNewTodo(event.target.value);
            }}
          />
          <button
            id='addButton'
            name='add'
            className={Styles.addButton}
            onClick={addTodo}
          >
            + New Todo
          </button>
        </span>
      </div>
      <div id='todoContainer' className={Styles.todoContainer}>
      {loading ? (
          <p style={{ color: 'white' }}>Loading...</p>
        ) : (
          todoData.length > 0 ? (
            todoData.map((entry, index) => (
              <div key={entry._id} className={Styles.todo}>
                <span className={Styles.infoContainer}>
                  {isEditing && entry._id === currentTodo._id ? (
                    // Render edit input if editing this todo
                    <input
                      type='text'
                      value={currentTodo.title}
                      onChange={(event) => {
                        setCurrentTodo({ ...currentTodo, title: event.target.value });
                      }}
                      style={{width:'200px'}}
                    />
                  ) : (
                    <>
                      <input
                        type='checkbox'
                        checked={entry.done}
                        onChange={() => {
                          updateTodo(entry._id);
                        }}
                      />
                      {entry.title}
                    </>
                  )}
                </span>
                <span style={{ cursor: 'pointer' }}>
                  {isEditing && entry._id === currentTodo._id ? (
                    // Render save button if editing this todo
                    <button onClick={() => updateTodo(entry._id)}>
                      Save
                    </button>
                  ) : (
                    // Render edit and delete buttons otherwise
                    <>
                      <button onClick={() => handleEditClick(entry)}>
                        Edit
                      </button>
                      <button onClick={() => deleteTodo(entry._id)}>
                        delete
                      </button>
                    </>
                  )}
                </span>
              </div>
            ))
          ) : (
            <p className={Styles.noTodoMessage}>No tasks available. Please add a new task.</p>
          )
        )}
      </div>
    </div>
  );
}

