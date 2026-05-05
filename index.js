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

    if (callbacks)
    {
        callbacks.forEach(callback => {
            element.addEventListener(callback.trigger, () => callback.method())
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
    constructor(title, isDone) {
        this.title = title;
        this.isDone = isDone;
    }
}

class TodoList extends Component {
    constructor() {
        super();
        this._state = {
            todos: [
                new Task('Сделать домашку', false),
                new Task('Сделать практику', false),
                new Task('Пойти домой', false),
            ],
            currentTitle: ''
        }
    }

    _renderTasksList() {
        const children = this._state.todos.map(task => {
            return createElement("li", {}, [
                createElement("input", {type: "checkbox"}),
                createElement("label", {}, task.title),
                createElement("button", {}, "🗑️")
            ])
        })

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
                    {trigger: 'click', method: () => this.onAddTask()}
                ]),
            ]),
            this._renderTasksList()
        ]);
    }

    onAddTask() {
        this._state.todos.push(new Task(this._state.currentTitle, false));
        this.update();
    }

    onAddInputChange() {
        this._state.currentTitle = document.querySelector('#new-todo').value;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});
