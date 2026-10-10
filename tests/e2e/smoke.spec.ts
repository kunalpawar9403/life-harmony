import { test, expect } from '@playwright/test';

test.describe('Automated QA Smoke Suite', () => {
  test('Verify Todo app loads and renders correctly', async ({ page }) => {
    // Navigates to Playwright's demo todo app
    await page.goto('/todomvc/');

    // Validate title and header
    await expect(page).toHaveTitle(/TodoMVC/);
    const header = page.locator('header.header h1');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('todos');

    // Add a new todo item
    const newTodoInput = page.getByPlaceholder('What needs to be done?');
    await expect(newTodoInput).toBeVisible();
    await newTodoInput.fill('Run n8n automated QA pipeline');
    await newTodoInput.press('Enter');

    // Verify item is present
    const todoItem = page.locator('.todo-list li').first();
    await expect(todoItem).toBeVisible();
    await expect(todoItem).toHaveText('Run n8n automated QA pipeline');

    // Complete the todo item
    const toggleButton = todoItem.locator('.toggle');
    await toggleButton.check();
    await expect(todoItem).toHaveClass(/completed/);
  });

  test('Verify filtering and item count', async ({ page }) => {
    await page.goto('/todomvc/');

    const newTodoInput = page.getByPlaceholder('What needs to be done?');
    await newTodoInput.fill('Task Alpha');
    await newTodoInput.press('Enter');
    await newTodoInput.fill('Task Beta');
    await newTodoInput.press('Enter');

    const todoCount = page.locator('.todo-count');
    await expect(todoCount).toContainText('2 items left');

    // Complete Task Alpha
    await page.locator('.todo-list li', { hasText: 'Task Alpha' }).locator('.toggle').check();
    await expect(todoCount).toContainText('1 item left');

    // Filter Active items
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').first()).toHaveText('Task Beta');

    // Filter Completed items
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').first()).toHaveText('Task Alpha');
  });
});
