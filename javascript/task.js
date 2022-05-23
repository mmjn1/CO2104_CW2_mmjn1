class Task {
  constructor(name) {
    this.name = name;
    this.id = `task-${new Date().getTime()}`;
    this.completed = false;
  }
}

export default Task;