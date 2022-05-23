class Storage {
  constructor() {
    this.name = 'task_list';
  }

  save(list) {
    const taskList = this.getAll();
    taskList[list.id] = list;
    localStorage.setItem(this.name, JSON.stringify(taskList));
  }

  update(lists) {
    localStorage.setItem(this.name, JSON.stringify(lists));
  }

  getAll() {
    if(localStorage.getItem(this.name)) {
      return JSON.parse(localStorage.getItem(this.name));
    }else {
      return {};
    }
  }
}

export default Storage;