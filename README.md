# useTemporalState

A lightweight and type-safe React hook for managing undo/redo state transitions. `useTemporalState` enhances `useState` by preserving a history of past and future states, making it easy to implement features like undo/redo or state time-travel in your app.

---

## ✨ Features

- 🔁 Undo & redo functionality
- 🧠 Tracks past, present, and future states
- 🪶 Lightweight with no external dependencies
- 💡 TypeScript and JavaScript support
- 🔧 Drop-in replacement for `useState`
- 🧹 Optional compression for large histories

---

## 📦 Installation

```bash
npm install use-temporal-state
```

or

```bash
yarn add use-temporal-state
```

---

## 🚀 Usage

```tsx
import useTemporalState from 'use-temporal-state';

function TodoApp() {
  const {
    state: todos,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useTemporalState<string[]>([], {
    limit: 100, // Optional: max history size
    shouldAddToHistory: (prev, next) => JSON.stringify(prev) !== JSON.stringify(next)
  });

  const addTodo = (text: string) => {
    set([...todos, text]);
  };

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
      <button onClick={() => addTodo('New Task')}>Add Todo</button>
      <ul>
        {todos.map((todo, index) => <li key={index}>{todo}</li>)}
      </ul>
    </div>
  );
}
```

---

## 🧠 API

```ts
const {
  state,     // Current state value
  set,       // Function to update state
  undo,      // Go back to the previous state
  redo,      // Go forward to the next state (if available)
  canUndo,   // Boolean flag for undo availability
  canRedo,   // Boolean flag for redo availability
} = useTemporalState<T>(initialValue, options?);
```

### Options

```ts
type TemporalOptions<T> = {
  limit?: number; // Max length of history (default: 50)
  shouldAddToHistory?: (prev: T, next: T) => boolean; // Custom comparison to skip duplicate states
};
```

---

## ✅ TypeScript Support

Fully typed. Generics supported out-of-the-box:

```ts
const {
  state,
  set,
  undo,
  redo,
} = useTemporalState<MyCustomType[]>([]);
```

---

## 📁 File Size

Minimal footprint, no dependencies. Suitable for all React projects.

---

## 📜 License

MIT — Free for personal and commercial use.

---

## 💬 Feedback & Contributions

Pull requests and suggestions are welcome!  
Star ⭐ the repo if you find it useful.

---

## 🧪 Coming Soon

- `jumpTo(index)` to move to any historical state
- State compression using deltas for deeply nested objects

---