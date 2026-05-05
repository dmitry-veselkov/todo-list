function createElement(tag, attributes, children, callbacks) {
    const element = document.createElement(tag);

    if (attributes) {
        Object.keys(attributes).forEach((key) => {
            element.setAttribute(key, attributes[key]);
        });
    }

    if (Array.isArray(children)) {
        children.forEach((child) => {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    } else if (typeof children === "string") {
        element.appendChild(document.createTextNode(children));
    } else if (children instanceof HTMLElement) {
        element.appendChild(children);
    }

    if (callbacks) {
        callbacks.forEach(callback => {
            element.addEventListener(callback.trigger, (event) => callback.method(event))
        })
    }

    return element;
}

class Component {
    constructor() {
    }

    getDomNode() {
        this._domNode = this.render();
        return this._domNode;
    }

    update() {
        this._domNode = this.render();
        document.body.innerHTML = '';
        document.body.appendChild(this._domNode);
    }
}

class Task {
    constructor(id, title, taskService) {
        this.id = id;
        this.title = title;
        this.ts = taskService;
        this._state = {
            deleteCount: 0,
        }
    }

    render() {
        return createElement("li", [], [
            createElement("input", {type: "checkbox"}, [], [
                {trigger: 'change', method: (event) => this.ts.complete(this.id, event.target)}
            ]),
            createElement("label", {id: `taskId_${this.id}`}, this.title),
            createElement("button", {id: `btnId_${this.id}`}, "🗑️", [
                {trigger: 'click', method: (event) => this.ts.removeTask(this.id, this._state)}
            ])
        ])
    }
}

class TaskService {
    constructor(state, update) {
        this._state = state;
        this.update = update;
    }

    onAddTask() {
        const id = this._state.currentTaskIndex;
        this._state.todos.push(new Task(id, this._state.currentTitle, this));
        this._state.currentTaskIndex++;
        this.update();
    }

    complete(id, target) {
        const label = document.getElementById(`taskId_${id}`);
        label.style.color = target.checked ? 'lightgray' : 'black';
    }

    removeTask(id, taskState) {
        if (taskState.deleteCount === 0) {
            taskState.deleteCount++;
            document.getElementById(`btnId_${id}`).style.backgroundColor = 'red';
        }
        else {
            this._state.todos = this._state.todos.filter(task => task.id !== id);
            this.update();
        }
    }
}

class TodoList extends Component {
    constructor() {
        super();
        this._state = {
            currentTaskIndex: 3,
            todos: [],
            currentTitle: ''
        }
        this._taskService = new TaskService(this._state, () => this.update());

        this.init();
    }

    init() {
        this._state.todos = [
            new Task(0, 'Сделать домашку', this._taskService),
            new Task(1, 'Сделать практику', this._taskService),
            new Task(2, 'Пойти домой', this._taskService),
        ];
    }

    _renderTasksList() {
        const children = this._state.todos.map(task => task.render())

        return createElement("ul", {id: "todos"}, children)
    }

    render() {
        return createElement("div", {class: "todo-list"}, [
            createElement("h1", {}, "TODO List"),
            createElement("div", {class: "add-todo"}, [
                createElement("input", {
                    id: "new-todo",
                    type: "text",
                    placeholder: "Задание",
                }, null, [{trigger: 'input', method: () => this.onAddInputChange()}]),
                createElement("button", {id: "add-btn"}, "+", [
                    {trigger: 'click', method: () => this._taskService.onAddTask()}
                ]),
            ]),
            this._renderTasksList()
        ]);
    }

    onAddInputChange() {
        this._state.currentTitle = document.querySelector('#new-todo').value;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});
