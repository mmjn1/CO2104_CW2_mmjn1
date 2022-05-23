import List from './list.js';
import Task from './task.js';
import Storage from './storage.js';
import UI from './ui.js';

// Get elements
const taskListsEl = document.getElementById('task-lists');
const noListsEl = document.getElementById('no-lists');
const newListFormEl = document.getElementById('new-list-form');
const listSelectEl = document.getElementById('list-select');
const notificationEl = document.getElementById('notification');
const notificationCloseEl = notificationEl.querySelector('button');
const editListModalEl = document.getElementById('edit-list-modal');
const editListModalFormEl = editListModalEl.querySelector('form');
const deleteListModalEl = document.getElementById('delete-list-modal');
const deleteListModalFormEl = deleteListModalEl.querySelector('form');
const closeEditListModalBtns = editListModalEl.querySelectorAll('.close-modal');
const closeDeleteListModalBtns = deleteListModalEl.querySelectorAll('.close-modal');
const taskSectionEl = document.getElementById('task-section');
const taskFormEl = document.getElementById('task-form');
const noTasksEl = document.getElementById('no-tasks');
const tasksTableEl = document.getElementById('tasks-table');
const editTaskModalEl = document.getElementById('edit-task-modal');
const deleteTaskModalEl = document.getElementById('delete-task-modal');
const editTaskModalFormEl = editTaskModalEl.querySelector('form');
const deleteTaskModalFormEl = deleteTaskModalEl.querySelector('form');
const closeEditTaskModalBtns = editTaskModalEl.querySelectorAll('.close-modal');
const closeDeleteTaskModalBtns = deleteTaskModalEl.querySelectorAll('.close-modal');

// Event listeners
newListFormEl.addEventListener('submit', createNewList);
editListModalFormEl.addEventListener('submit', editList.bind(editListModalFormEl, editListModalEl));
for(let closeModalBtn of closeEditListModalBtns) {
  closeModalBtn.addEventListener('click', closeEditListModal);
}
deleteListModalFormEl.addEventListener('submit', deleteList.bind(deleteListModalFormEl, deleteListModalEl));
for(let closeModalBtn of closeDeleteListModalBtns) {
  closeModalBtn.addEventListener('click', closeDeleteListModal);
}
notificationCloseEl.addEventListener('click', closeNotification);
listSelectEl.addEventListener('change', onSelectChange);
taskFormEl.addEventListener('submit', addNewTask);
editTaskModalFormEl.addEventListener('submit', editTask.bind(editTaskModalFormEl, editTaskModalEl));
deleteTaskModalFormEl.addEventListener('submit', deleteTask.bind(deleteTaskModalFormEl, deleteTaskModalEl));
for(let closeModalBtn of closeEditTaskModalBtns) {
  closeModalBtn.addEventListener('click', closeEditTaskModal);
}
for(let closeModalBtn of closeDeleteTaskModalBtns) {
  closeModalBtn.addEventListener('click', closeDeleteTaskModal);
}

// Create new instances of Storage and UI classes
const storage = new Storage();
const ui = new UI({
  listsEl: taskListsEl,
  noListsEl: noListsEl,
  listSelectEl: listSelectEl,
  notificationEl: notificationEl,
  editListModalEl: editListModalEl,
  deleteListModalEl: deleteListModalEl,
  taskSectionEl: taskSectionEl,
  noTasksEl: noTasksEl,
  tasksTableEl: tasksTableEl,
  editTaskModalEl: editTaskModalEl,
  deleteTaskModalEl: deleteTaskModalEl
});

// Add lists to the DOM
ui.showLists(storage);

// Create new list
function createNewList(e) {
  e.preventDefault();
  
  const input = this.querySelector('input');

  if(input.value.trim() === '') {
    return alert('Category name is required!');
  }

  const list = new List(input.value);
  storage.save(list);
  input.value = '';
  ui.addListToDOM(list, storage);
  ui.addListToSelect(list);
  ui.showNotification(`New list(${list.name}) created!`);
}

// Edit list
function editList(modal, e) {
  e.preventDefault();
  const listId = this.querySelector('input[name="listid"]').value;
  const listName = this.querySelector('input[name="listname"]').value;
  const list = storage.getAll()[listId];
  const copiedList = {...list};
  if(listName === '') {
    alert('List name is requied!');
  }else if(listName === list.name) {
    alert('List name is the same as before!');
  }else {
    copiedList.name = listName;
    storage.save(copiedList);
    modal.classList.remove('is-active');
    taskListsEl.innerHTML = '';
    ui.showLists(storage, false);
    ui.showNotification(`List "${list.name}" updated!`);
    ui.updateListInsideSelect(listId, listName);
  }
}

// Close edit list modal 
function closeEditListModal(e) {
  e.preventDefault();
  ui.closeEditListModal();
}

// Delete list
function deleteList(modal, e) {
  e.preventDefault();
  const listId = this.querySelector('input[name="listid"]').value;
  const allLists = storage.getAll();
  const listName = allLists[listId].name;
  const copiedLists = {...allLists};
  delete copiedLists[listId];
  storage.update(copiedLists);
  modal.classList.remove('is-active');
  taskListsEl.innerHTML = '';
  ui.showLists(storage, false);
  ui.showNotification(`List "${listName}" deleted!`, 'danger');
  ui.deleteListFromSelect(listId);
  modal.querySelector('.content ul').innerHTML = '';
  if(listSelectEl.value === '') {
    ui.toggleTaskSection('');
  }
  if(Object.keys(storage.getAll()).length === 0) {
    ui.showNoLists();
  }
}

// Close delete list modal 
function closeDeleteListModal(e) {
  e.preventDefault();
  ui.closeDeleteListModal();
}

// Close notification
function closeNotification(e) {
  e.preventDefault();
  ui.closeNotification();
}

// Change list
function onSelectChange(e) {
  const value = e.target.value;
  ui.toggleTaskSection(value);
  if(value !== '') {
    const list = storage.getAll()[value];
    ui.showTasksInList(list);
  }
}

// Add new task to selected list
function addNewTask(e) {
  e.preventDefault();
  const input = this.querySelector('input[type="text"]');
  if(input.value.trim() === '') {
    return alert('Task name is required');
  }

  const task = new Task(input.value);
  const listId = listSelectEl.value;
  const allLists = storage.getAll();
  const copiedLists = {...allLists};
  const list = copiedLists[listId];
  list.tasks.push(task);
  storage.update(copiedLists);
  ui.addTaskToDOM(task, list.tasks);
  ui.showNotification(`Task "${task.name}" created and added to "${list.name}"!`);
  input.value = '';
}

// Edit task
function editTask(modal, e) {
  e.preventDefault();
  const taskId = this.querySelector('input[name="taskid"]').value;
  const taskName = this.querySelector('input[name="taskname"]').value;
  const taskState = this.querySelector('input[name="taskstate"]').checked;
  const listId = listSelectEl.value;
  const list = storage.getAll()[listId];
  const copiedList = JSON.parse(JSON.stringify(list));
  const copiedTasks = [...copiedList.tasks];
  const selectedTask = copiedTasks.find(task => task.id === taskId);
  const copiedTask = {...selectedTask};

  if(taskName === '') {
    alert('Task name is required!');
  }else if(taskName === selectedTask.name && taskState === selectedTask.completed) {
    alert('Task name and state are same as before!');
  }else {
    copiedTask.name = taskName;
    copiedTask.completed = taskState;
    const updatedTasks = copiedList.tasks.map(task => task.id === copiedTask.id ? copiedTask : task);
    copiedList.tasks = updatedTasks;
    storage.save(copiedList);
    modal.classList.remove('is-active');
    ui.addTasksToTable(copiedList);
    ui.showNotification(`Task "${selectedTask.name}" from "${list.name}" updated!`);
  }

}

// Delete task
function deleteTask(modal, e) {
  e.preventDefault();
  const taskId = this.querySelector('input[name="taskid"]').value;
  const listId = listSelectEl.value;
  const list = storage.getAll()[listId];
  const copiedList = JSON.parse(JSON.stringify(list));
  const copiedTasks = [...copiedList.tasks];
  const task = copiedTasks.find(task => task.id === taskId);
  const taskIndex = copiedTasks.indexOf(task);
  copiedTasks.splice(taskIndex, 1);
  copiedList.tasks = copiedTasks;
  storage.save(copiedList);
  modal.classList.remove('is-active');
  ui.addTasksToTable(copiedList);
  ui.showNotification(`Task "${task.name}" deleted from "${list.name}"!`, 'danger');
  if(storage.getAll()[listId].tasks.length === 0) {
    tasksTableEl.classList.add('is-hidden');
    noTasksEl.classList.remove('is-hidden');
  }
}

// Close edit task modal
function closeEditTaskModal(e) {
  e.preventDefault();
  ui.closeEditTaskModal();
}

// Close delete task modal
function closeDeleteTaskModal(e) {
  e.preventDefault();
  ui.closeDeleteTaskModal();
}