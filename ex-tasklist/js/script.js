(() => {
  //------------------------------MAIN MODULE------------------------------
  "use strict";

  document.addEventListener("DOMContentLoaded", (e) => {
    //all elements that appear and disappear when we hide/show form
    const toHide = document.querySelectorAll(".containersToHide");

    let taskList = {
      list: [],
      taskListPosition: document.getElementById("taskList"),
      direction: "Ascending",
      filtered: () => {
        const filtering = formMan.getFiltering();
        return taskList.list.filter((task) => {
          return filtering === "All" || task.category === filtering;
        });
      },
      sort: () => {
        taskList.list.sort((a, b) => {
          const dateCompare =
            taskList.direction === "Ascending"
              ? new Date(a.date) - new Date(b.date)
              : new Date(b.date) - new Date(a.date);

          if (dateCompare === 0) {
            return b.priority - a.priority;
          }
          return dateCompare;
        });
      },
    };

    const formMan = formManager();

    const form = document.getElementById("newTaskForm");
    const formMod = formModule(taskList, form, toHide, formMan);

    const renderer = rendererModule(
      taskList,
      formMod.deleteTask,
      formMod.editTask
    );

    form.addEventListener("submit", (e) => {
      formMod.saveNewTask(e);
      renderer();
    });

    document
      .getElementById("showForm")
      .addEventListener("click", formMod.showForm);

    document
      .getElementById("hideForm")
      .addEventListener("click", formMod.hideAndClearForm);

    document
      .getElementById("category-filter")
      .addEventListener("change", (e) => {
        formMan.setFiltering(e.target.value);
        renderer();
      });

    document.getElementById("sortButton").addEventListener("click", (e) => {
      const isAscending = e.target.getAttribute("aria-pressed") === "true";

      if (isAscending) {
        e.target.textContent = "Sort by Due Time: Descending";
        e.target.setAttribute("aria-pressed", "false");
        taskList.direction = "Descending";
      } else {
        e.target.textContent = "Sort by Due Time: Ascending";
        e.target.setAttribute("aria-pressed", "true");
        taskList.direction = "Ascending";
      }
      renderer();
    });

    setInterval(renderer, 60000);
  });

  //------------------------------FORM MODULE------------------------------

  /**
   * get the list, the form, objects toHide and formManager, basically manages most
   * of the display and deleting and editing tasks
   * @param {taskList object} taskList
   * @param {HTMLFormElement} form
   * @param {Array<HTMLElement>} toHide
   * @param {Object} formManager
   * @returns {Object}
   */
  const formModule = (taskList, form, toHide, formManager) => {
    const validate = validatorModule();

    /**
     * deletes a task from the list by specific id
     * @param {number} id
     */
    const deleteTask = (id) => {
      taskList.list = taskList.list.filter((task) => task.id !== id);
    };

    /**
     * sets edit mode for the form and fills the form with task values
     * @param {number} id
     */
    const editTask = (id) => {
      showForm(toHide, form);

      const taskToEdit = taskList.list.find((task) => task.id === id);

      form.taskname.value = taskToEdit.name;
      form.category.value = taskToEdit.category;
      form.dateInput.value = taskToEdit.date;
      form.description.value = taskToEdit.description;

      const priorityRadio = document.querySelector(
        `input[name="inlineRadioOptions"][value="${taskToEdit.priority}"]`
      );
      priorityRadio.checked = true;

      formManager.setMode("edit", id);
    };

    /**
     * shows the form and hides all other items
     */
    const showForm = () => {
      toHide.forEach((item) => {
        item.classList.add("d-none");
      });

      form.classList.remove("d-none");
    };

    /**
     * hides the form and clears it, shows other items
     */
    const hideAndClearForm = () => {
      form.classList.add("d-none");
      toHide.forEach((item) => {
        item.classList.remove("d-none");
      });
      form.reset();
    };

    /**
     * gets a string and dom element and insert error message
     * @param {DOMElement} element
     * @param {string} errorMessage
     */
    const generateErrorMessage = (element, errorMessage) => {
      element.insertAdjacentHTML(
        "afterend",
        `<div class="text-danger mb-2">${errorMessage}</div>`
      );
    };

    /**
     * clears errors from the form
     */
    const clearErrors = () => {
      let toClear = document.querySelectorAll(".text-danger");
      toClear?.forEach((element) => {
        element.remove();
      });
    };

    /**
     * gets the form, creates a task, validates it, and inserts it in place
     * @param {HTMLElement} event
     */
    const saveNewTask = (event) => {
      event.preventDefault();

      clearErrors();

      let newTask = {};
      newTask.taskName = event.target.taskname;
      newTask.category = event.target.category;
      newTask.date = event.target.dateInput;
      newTask.description = event.target.description;
      newTask.priority = document.querySelector(
        'input[name="inlineRadioOptions"]:checked'
      );

      const errors = validate(newTask);

      if (Object.keys(errors).length === 0) {
        const formMode = formManager.getMode();
        if (formMode.mode === "create") {
          taskList.list.push(new Task(newTask));
        } else {
          const index = taskList.list.findIndex(
            (item) => item.id === formMode.id
          );
          index !== -1 && (taskList.list[index] = new Task(newTask));
          formManager.resetMode();
        }
        hideAndClearForm();
        // taskList.sort();
      } else {
        for (const field in newTask) {
          if (errors[field]) {
            generateErrorMessage(newTask[field], errors[field]);
          }
        }
      }
    };

    return {
      showForm,
      hideAndClearForm,
      deleteTask,
      editTask,
      saveNewTask,
    };
  };

  //------------------------------FORM MANAGER MODULE------------------------------

  /**
   * formManager object sets if we edit or create tasks,
   * with it we also can check the filtering mode
   * @returns Object
   */
  const formManager = () => {
    let mode = "create";
    let id = null;
    let filtering = "All";

    /**
     * reset to creation mode
     */
    const resetMode = () => {
      mode = "create";
      id = null;
    };

    /**
     * gets a mode name and a task id
     * @param {string} newMode
     * @param {number} newId
     */
    const setMode = (newMode, newId = null) => {
      mode = newMode;
      id = newId;
    };

    /**
     * gets the proper string to be filtered according to
     * @param {string} filteringValue
     */
    const setFiltering = (filteringValue) => {
      filtering = filteringValue;
    };

    /**
     * Returns the current mode and id.
     * @returns {Object} An object containing the current mode and id.
     * @returns {string} return.mode - The current mode.
     * @returns {number} return.id - The id associated with the current mode.
     */
    const getMode = () => {
      return { mode, id };
    };

    /**
     * returns the current filtering mode
     * @returns {string}
     */
    const getFiltering = () => {
      return filtering;
    };

    return {
      resetMode,
      setMode,
      setFiltering,
      getMode,
      getFiltering,
    };
  };

  //------------------------------VALIDATOR MODULE------------------------------

  /**
   * A module that provides validation for task fields like task name, category, date, and description.
   * @returns {Function} A function that validates a task object based on the defined validation rules.
   * @returns {Object} The returned function takes a `task` object and returns an object with error messages for invalid fields.
   * @returns {Object<string, string>} The validation errors for the task fields. Keys are field names (e.g., 'taskName', 'category'), and values are error messages if validation fails.
   */
  const validatorModule = () => {
    const validationRules = {
      taskName: (value) => {
        if (!value) return "Task name can not be empty.";
        if (!/^[A-Za-z0-9 ]+$/.test(value)) {
          return "Please enter a valid task name (a-zA-Z0-9).";
        }
        return null;
      },
      category: (value) => {
        if (value === "Category") return "Please select a category.";
        return null;
      },
      date: (value) => {
        if (!value) return "Please insert a date.";
        return null;
      },
      description: (value) => {
        if (!/^[a-zA-Z0-9 .,!?'"-]*$/.test(value))
          return `Please enter a valid description (a-zA-Z0-9 .,!?'"-)`;
        return null;
      },
    };

    /**
     * Validates the fields of a task object based on predefined validation rules.
     * @param {Object} task - The task object containing fields to be validated. Each field should have a `value` property.
     * @returns {Object} An object containing validation errors. Keys are the field names (e.g., 'taskName', 'category'), and values are error messages if validation fails.
     * If a field is valid, it will not appear in the returned object.
     */
    const validate = (task) => {
      let errors = {};
      for (const field in validationRules) {
        const validatonFunc = validationRules[field];
        const fieldToValidate = task[field]?.value;
        const error = validatonFunc(fieldToValidate);

        if (error) {
          errors[field] = error;
        }
      }
      return errors;
    };

    return validate;
  };

  //------------------------------TASK MODULE------------------------------
  class Task {
    static nextId = 1;
    #id;
    #name;
    #category;
    #priority;
    #date;
    #description;

    constructor(taskObj) {
      this.#id = Task.nextId++;
      this.#name = taskObj.taskName.value;
      this.#category = taskObj.category.value;
      this.#priority = Number(taskObj.priority.value);
      this.#date = taskObj.date.value;
      this.#description = taskObj.description.value;
    }

    get id() {
      return this.#id;
    }

    get name() {
      return this.#name;
    }

    get category() {
      return this.#category;
    }

    get description() {
      return this.#description;
    }

    get date() {
      return this.#date;
    }

    get priority() {
      return this.#priority;
    }

    timeLeft() {
      const now = new Date();
      const diff = new Date(this.#date) - now;

      if (diff <= 0) {
        return "Overdue";
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return `${days}d ${hours}h ${minutes}m`; //always displaying 00d 00h 00m, need to make it so only whats relevant stays
    }

    getPriorityAsString() {
      switch (this.#priority) {
        case 1:
          return "Low Priority";
        case 2:
          return "Medium Priority";
        case 3:
          return "High Priority";
        default:
      }
    }
  }

  //------------------------------RENDERER MODULE------------------------------

  /**
   * A module that handles rendering a task list, including displaying tasks,
   * handling edit and delete actions, and updating the task list UI.
   * @param {Array<Object>} taskList - An array of task objects that need to be rendered. Each task should have properties like `id`, `name`, `category`, `getPriorityAsString`, `description`, and `timeLeft`.
   * @param {Function} deleteTask - A function to delete a task based on its `id`.
   * @param {Function} editTask - A function to edit a task based on its `id`.
   * @returns {Function} A function that renders the task list. When called, it sorts the tasks, filters them, and updates the UI to reflect the current list of tasks.
   */
  const rendererModule = (taskList, deleteTask, editTask) => {
    /**
     * Renders a task as a row of HTML elements, including task details and buttons for editing and deleting.
     * @param {Object} task - The task object to render. It should have properties such as `id`, `name`, `category`, `description`, `timeLeft`, and `getPriorityAsString`.
     * @returns {HTMLElement} A `div` element representing the task row with its details and action buttons (edit and delete).
     */
    const renderTask = (task) => {
      let row = document.createElement("div");
      row.classList.add(
        "border",
        "rounded",
        "p-2",
        task.timeLeft() === "Overdue" && "bg-danger-subtle"
      );
      row.id = task.id;
      row.innerHTML = `
        <div class="d-flex flex-wrap align-items-center">
          <p class="mb-0 col-md-8 col-6">${task.name} (${
        task.category
      }) - ${task.getPriorityAsString()} -  ${task.description}</p>
          <p class="col-md-2 col-2 mb-0"> ${task.timeLeft()}</p>
          <button class="btn btn-warning col-md-1 col-2">edit</button>
          <button class="btn btn-danger col-md-1 col-2">delete</button>
        </div>`;

      return row;
    };

    /**
     * Renders the list of tasks by sorting, filtering, and updating the task list UI.
     * It also handles the visibility of the "empty list" message based on the filtered tasks.
     * For each task, it creates a row with edit and delete buttons, and attaches event listeners
     * for those actions.
     */
    const renderTaskList = () => {
      taskList.sort();
      const filteredTasks = taskList.filtered();

      if (filteredTasks.length !== 0) {
        document.getElementById("emptylist").classList.add("d-none");
      } else {
        document.getElementById("emptylist").classList.remove("d-none");
      }

      taskList.taskListPosition.innerHTML = "";

      filteredTasks.forEach((task) => {
        const row = renderTask(task);

        row.querySelector(".btn-danger").addEventListener("click", () => {
          deleteTask(task.id);
          renderTaskList();
        });

        row.querySelector(".btn-warning").addEventListener("click", () => {
          editTask(task.id);
        });

        taskList.taskListPosition.append(row);
      });
    };

    return renderTaskList;
  };
})();
