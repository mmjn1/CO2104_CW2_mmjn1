class UI {
  constructor({
    listsEl, noListsEl, listSelectEl, notificationEl, editListModalEl,
    deleteListModalEl, taskSectionEl, noTasksEl, tasksTableEl,
    editTaskModalEl, deleteTaskModalEl
  }){
    this.listsEl = listsEl;
    this.noListsEl = noListsEl;
    this.listSelectEl = listSelectEl;
    this.notificationEl = notificationEl;
    this.editListModalEl = editListModalEl;
    this.deleteListModalEl = deleteListModalEl;
    this.taskSectionEl = taskSectionEl;
    this.noTasksEl = noTasksEl;
    this.tasksTableEl = tasksTableEl;
    this.editTaskModalEl = editTaskModalEl;
    this.deleteTaskModalEl = deleteTaskModalEl;
    this.timeout = null;
  }

  // Show all lists
  showLists(storage, addToSelect = true) {
    const lists = storage.getAll();
    if(Object.keys(lists).length > 0) {
      this.noListsEl.classList.add('is-hidden');

      for(let list in lists) {
        const listEl = this.createListElement(lists[list], storage);
        this.listsEl.appendChild(listEl);
        if(addToSelect) {
          this.addListToSelect(lists[list], this.listSelectEl);
        }
      }
    }
  }

  // Create list element
  createListElement(list, storage) {
    const listEl = document.createElement('div');
    listEl.className = 'panel-block py-3';
    listEl.innerHTML = `
      <p>${list.name}</p>
      <span class="panel-icon has-text-danger"><i class="fas fa-times-circle"></i></span>
    `;
    listEl.querySelector('p').addEventListener('click', this.openEditListModal.bind(this, list));
    listEl.querySelector('.panel-icon').addEventListener('click', this.openDeleteListModal.bind(this, list.id, storage));
    return listEl;
  }

  // Add list to select element
  addListToSelect(list) {
    const option = document.createElement('option');
    option.value = list.id;
    option.textContent = list.name;
    this.listSelectEl.appendChild(option);
  }

  // Add list to DOM
  addListToDOM(list, storage) {
    if(this.listsEl.children.length === 0 && this.noListsEl.offsetParent) {
      this.noListsEl.classList.add('is-hidden');
    }
    if(this.listsEl.classList.contains('is-hidden')) {
      this.listsEl.classList.remove('is-hidden');
    }

    const listBlock = this.createListElement(list, storage);
    this.listsEl.appendChild(listBlock);
  }

  // Open edit list modal
  openEditListModal(list) {
    this.editListModalEl.classList.add('is-active');
    this.editListModalEl.querySelector('input[name="listid"]').value = list.id;
    this.editListModalEl.querySelector('input[name="listname"]').value = list.name;
  }

  // Open delete list modal
  openDeleteListModal(listId, storage) {
    const lists = storage.getAll();
    this.deleteListModalEl.classList.add('is-active');
    this.deleteListModalEl.querySelector('input[name="listid"]').value = listId;
    const ul = this.deleteListModalEl.querySelector('.content ul');
    const p = this.deleteListModalEl.querySelector('.content p');
    const tasks = lists[listId].tasks;
    if(tasks.length === 0) {
      p.classList.remove('is-hidden');
      ul.classList.add('is-hidden');
    }else {
      p.classList.add('is-hidden');
      ul.classList.remove('is-hidden');
      ul.innerHTML = tasks.map(task => `
        <li>${task.name}</li>
      `).join('');
    }
  }

  // Show notification
  showNotification(msg, type = 'success', duration = 5000) {
    if(this.timeout) {
      clearTimeout(this.timeout);
    }

    this.notificationEl.className = type === 'danger' ? 'notification is-danger' : 'notification is-primary';
    this.notificationEl.querySelector('p').textContent = msg;
    this.timeout = setTimeout(() => {
      this.notificationEl.classList.add('is-hidden');
    }, duration);
  }

  // Update list inside select element
  updateListInsideSelect(id, name) {
    this.listSelectEl.querySelector(`option[value="${id}"]`).textContent = name;
  }

  // Close edit list modal
  closeEditListModal() {
    this.editListModalEl.classList.remove('is-active');
  }

  // Delete list from select
  deleteListFromSelect(id) {
    this.listSelectEl.querySelector(`option[value="${id}"]`).remove();
  }

  // Show no lists text
  showNoLists() {
    this.noListsEl.classList.remove('is-hidden');
    this.listsEl.classList.add('is-hidden');
  }

  // Close delete list modal
  closeDeleteListModal() {
    this.deleteListModalEl.classList.remove('is-active');
    this.deleteListModalEl.querySelector('.content ul').innerHTML = '';
  }

  // Close notification
  closeNotification() {
    clearTimeout(this.timeout);
    this.notificationEl.classList.add('is-hidden');
  }

  // Toggle task section
  toggleTaskSection(value) {
    if(value !== '') {
      this.taskSectionEl.classList.remove('is-hidden');
    }else {
      this.taskSectionEl.classList.add('is-hidden');
    }
  }

  // Show tasks in list
  showTasksInList(list) {
    if(list.tasks.length > 0) {
      this.tasksTableEl.classList.remove('is-hidden');
      this.noTasksEl.classList.add('is-hidden');
      this.addTasksToTable(list);
    }else {
      this.noTasksEl.classList.remove('is-hidden');
      if(!this.tasksTableEl.classList.contains('is-hidden')) {
        this.tasksTableEl.classList.add('is-hidden');
        this.tasksTableEl.querySelector('tbody').innerHTML = '';
      }
    }
  }

  // Add tasks to table
  addTasksToTable(list) {
    const tasks = list.tasks;
    const tBody = this.tasksTableEl.querySelector('tbody');
    tBody.innerHTML = '';

    tasks.forEach(task => {
      const tr = this.createTaskElement(task);
      tBody.appendChild(tr);
    });
  }

  // Create task element
  createTaskElement(task) {
    const tr = document.createElement('tr');
    tr.className = task.completed ? 'completed' : '';
    tr.innerHTML = `
      <td>${task.name}</td>
      <td class="has-text-centered">
        <button class="button is-primary is-small edit-task-btn">
          <span class="icon">
            <i class="fas fa-edit"></i>
          </span>
        </button>
      </td>
      <td class="has-text-centered">
        <button class="button is-danger is-small delete-task-btn">
          <span class="icon">
            <i class="fas fa-times"></i>
          </span>
        </button>
      </td>
    `;
    tr.querySelector('.edit-task-btn').addEventListener('click', this.openEditTaskModal.bind(this, task));
    tr.querySelector('.delete-task-btn').addEventListener('click', this.openDeleteTaskModal.bind(this, task));
    return tr;
  }

  // Add task to DOM
  addTaskToDOM(task, tasks) {
    const tr = this.createTaskElement(task);
    this.tasksTableEl.querySelector('tbody').appendChild(tr);
    if(tasks.length === 1) {
      this.noTasksEl.classList.add('is-hidden');
      this.tasksTableEl.classList.remove('is-hidden');
    }
  }

  // Open edit task modal
  openEditTaskModal(task, e) {
    e.preventDefault();
    this.editTaskModalEl.classList.add('is-active');
    this.editTaskModalEl.querySelector('input[name="taskid"]').value = task.id;
    this.editTaskModalEl.querySelector('input[name="taskname"]').value = task.name;
    this.editTaskModalEl.querySelector('input[name="taskstate"]').checked = task.completed;
  }

  // Open delete task modal
  openDeleteTaskModal(task, e) {
    e.preventDefault();
    this.deleteTaskModalEl.classList.add('is-active');
    this.deleteTaskModalEl.querySelector('input[name="taskid"]').value = task.id;
  }

  // Close edit task modal
  closeEditTaskModal() {
    this.editTaskModalEl.classList.remove('is-active');
  }

  // Close delete task modal
  closeDeleteTaskModal() {
    this.deleteTaskModalEl.classList.remove('is-active');
  }
}

export default UI;