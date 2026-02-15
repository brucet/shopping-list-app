# IntelliJ Default Formatting Guidelines

This document outlines the file formatting conventions that align with IntelliJ's default settings. Adhering to these guidelines ensures consistency across the codebase.

## General Principles

*   **Consistency is Key**: If a specific formatting rule is not explicitly mentioned here, follow the style already present in the surrounding code.
*   **Automated Formatting**: Utilize IntelliJ's built-in formatter (`Ctrl+Alt+L` on Windows/Linux, `Cmd+Option+L` on macOS) before committing changes. This will automatically apply most of these rules.

## Specific Formatting Rules

### 1. Indentation

*   **Indent Size**: 4 spaces.
*   **Use Spaces, Not Tabs**: Tabs should be converted to spaces.

### 2. Line Endings

*   **Unix-style Line Endings**: All files should use LF (Line Feed) as line endings.

### 3. Brace Style (for languages like Java, JavaScript, TypeScript, C#, etc.)

*   **"K&R" Style / Egyptian Brackets**: Opening braces are placed on the same line as the declaration, while closing braces are on their own line.
    ```java
    public class MyClass {
        public void myMethod() {
            // code
        }
    }
    ```

### 4. Whitespace

*   **Spaces Around Operators**: Ensure spaces around binary operators (e.g., `=`, `+`, `-`, `*`, `/`, `==`, `&&`, `||`).
    ```javascript
    let x = 1 + 2;
    if (a === b) { /* ... */ }
    ```
*   **Spaces After Commas**: Always include a space after a comma in parameter lists, array initializers, etc.
    ```javascript
    myFunction(arg1, arg2);
    let arr = [1, 2, 3];
    ```
*   **Spaces After Keywords**: Include a space after control flow keywords (e.g., `if`, `for`, `while`, `catch`).
    ```java
    if (condition) { /* ... */ }
    for (int i = 0; i < 10; i++) { /* ... */ }
    ```
*   **No Spaces Before Parentheses**: Do not include a space between a method/function name and its opening parenthesis.
    ```javascript
    myFunction(arg);
    ```

### 5. Blank Lines

*   **Between Declarations**: Use a single blank line to separate class members, methods, or logical blocks of code for readability.
*   **At File End**: Ensure a single blank line at the end of each file.

### 6. Maximum Line Length

*   **Soft Wrap at 120 Characters**: Aim for lines not exceeding 120 characters for better readability on various screens. IntelliJ provides a visual guide for this.

### 7. Imports (for languages like Java, TypeScript, Python)

*   **Organize Imports**: Imports should be grouped and sorted alphabetically. IntelliJ can do this automatically (`Optimize Imports` action or on save).
*   **No Unused Imports**: Remove any unused imports.

### 8. Naming Conventions

*   Follow standard naming conventions for the specific language (e.g., `camelCase` for variables/functions, `PascalCase` for classes/components, `snake_case` for Python variables). While not strictly a "formatting" rule, consistent naming is crucial for readability and is often enforced by IDEs.

### 9. Trailing Commas (for JavaScript/TypeScript)

*   **Wherever possible**: Use trailing commas in multi-line arrays, objects, and function parameters for cleaner diffs.

    ```javascript
    const myObject = {
        key1: 'value1',
        key2: 'value2',
    };
    ```

By following these guidelines and regularly using IntelliJ's built-in formatting features, we can maintain a clean and consistent codebase.