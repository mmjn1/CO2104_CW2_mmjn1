class List {
  constructor(name) {
    this.name = name;
    this.id = `list-${new Date().getTime()}`;
    this.tasks = [];
  }
}

export default List;