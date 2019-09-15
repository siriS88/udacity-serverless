import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import TodosAccess from '../dataLayer/todosAccess';

const TodosAccessInstance = new TodosAccess();

export async function getAllTodosForUser(userId: string,
): Promise<TodoItem[]> {
    return await TodosAccessInstance.getAllTodosForUser(userId);
}

export async function createTodo(
    CreateTodoRequest: CreateTodoRequest, userId: string
): Promise<TodoItem> {
    const dueDateTimestamp = Date.parse(CreateTodoRequest.dueDate);
    const itemId = uuid.v4();

    const newItem: TodoItem = {
        userId,
        todoId: itemId,
        createdAt: new Date().toISOString(),
        name: CreateTodoRequest.name || 'New Todo',
        dueDate: new Date(dueDateTimestamp).toISOString(),
        done: false,
        attachmentUrl: 'default'
    };
    return await TodosAccessInstance.createTodo(newItem);
}

export async function updateTodo(todoId: string, updateTodoItem: TodoUpdate
): Promise<void> {
    const validTodo = await TodosAccessInstance.todoExists(todoId);
    if (!validTodo) {
        throw {
            status: 404,
            error: new Error("TODO does not exist")
        }
    }
    return await TodosAccessInstance.updateTodo(todoId, updateTodoItem);
}

export async function deleteTodo(todoId: string
): Promise<void> {
    const validTodo = await TodosAccessInstance.todoExists(todoId);
    if (!validTodo) {
        throw {
            status: 404,
            error: new Error("TODO does not exist")
        }
    }
    return await TodosAccessInstance.deleteTodo(todoId);
}

export async function getUploadUrl(todoId: string
): Promise<string> {
    const validTodo = await TodosAccessInstance.todoExists(todoId);
    if (!validTodo) {
        throw {
            status: 404,
            error: new Error("TODO does not exist")
        }
    }
    const imageId = uuid.v4();
    return await TodosAccessInstance.generateUploadUrl(todoId, imageId);
}
