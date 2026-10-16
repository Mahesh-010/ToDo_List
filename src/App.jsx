import React, { Component, useEffect, useMemo, useState } from 'react';

const DEMO_EMAIL = 'student@example.com';
const DEMO_PASSWORD = 'password123';
const TODO_KEY = 'simple-todo-items';
const SESSION_KEY = 'simple-todo-logged-in';

function readStoredValue(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Keep the app usable if browser storage is disabled or full.
  }
}

function removeStoredValue(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Logging out still updates the current view if storage is unavailable.
  }
}

function readTodos() {
  try {
    const savedTodos = JSON.parse(readStoredValue(TODO_KEY, '[]'));
    if (!Array.isArray(savedTodos)) return [];
    return savedTodos.filter((todo) => todo && typeof todo.id === 'string' && typeof todo.title === 'string')
      .map((todo) => ({ ...todo, completed: Boolean(todo.completed) }));
  } catch {
    return [];
  }
}

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <main className="login-page"><section className="login-card"><div className="brand-mark" aria-hidden="true">!</div><h1>Something went wrong</h1><p className="login-intro">Reload the page to try again.</p><button className="primary-button login-button" onClick={() => window.location.reload()}>Reload page <span aria-hidden="true">→</span></button></section></main>;
    }
    return this.props.children;
  }
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('That email and password do not match. Try the demo credentials below.');
      return;
    }
    setError('');
    onLogin();
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true">✓</div>
        <p className="eyebrow">A LITTLE MORE FOCUS</p>
        <h1 id="login-title">Welcome back</h1>
        <p className="login-intro">Sign in to make room for what matters.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button login-button" type="submit">Sign in <span aria-hidden="true">→</span></button>
        </form>
        <div className="demo-note"><span className="demo-dot" /> <span>Demo access<br /><strong>student@example.com</strong> · <strong>password123</strong></span></div>
      </section>
      <p className="login-footer">Small steps add up.</p>
    </main>
  );
}

function TodoApp({ todos, setTodos, onLogout }) {
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('All');
  const [clearMessage, setClearMessage] = useState(false);
  const remainingCount = todos.filter((todo) => !todo.completed).length;
  const visibleTodos = useMemo(() => todos.filter((todo) => {
    if (filter === 'Active') return !todo.completed;
    if (filter === 'Completed') return todo.completed;
    return true;
  }), [todos, filter]);

  function addTodo(event) {
    event.preventDefault();
    const title = newTodo.trim();
    if (!title) return;
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setTodos((current) => [{ id, title, completed: false }, ...current]);
    setNewTodo('');
    setClearMessage(false);
  }

  function toggleTodo(id) {
    setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  }

  function deleteTodo(id) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  return (
    <main className="todo-page">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Daymark home"><span className="brand-mark small" aria-hidden="true">✓</span> daymark</a>
        <button className="logout-button" onClick={onLogout}>Log out <span aria-hidden="true">↗</span></button>
      </header>
      <section className="todo-content" aria-labelledby="todo-title">
        <p className="eyebrow date-label">YOUR PERSONAL SPACE</p>
        <h1 id="todo-title">A clear mind<br />starts <span>here.</span></h1>
        <p className="todo-subtitle">One thing at a time. You’ve got this.</p>

        <form className="add-form" onSubmit={addTodo}>
          <span className="add-icon" aria-hidden="true">+</span>
          <input aria-label="New todo" placeholder="What needs your attention?" value={newTodo} onChange={(event) => setNewTodo(event.target.value)} />
          <button className="primary-button add-button" type="submit">Add task <span aria-hidden="true">→</span></button>
        </form>

        <div className="list-heading">
          <div><h2>Your tasks</h2><p>{remainingCount === 0 ? 'All clear. Enjoy the breathing room.' : `${remainingCount} ${remainingCount === 1 ? 'thing' : 'things'} left to do`}</p></div>
          <div className="filters" aria-label="Filter tasks">
            {['All', 'Active', 'Completed'].map((item) => <button key={item} className={filter === item ? 'filter-button selected' : 'filter-button'} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>)}
          </div>
        </div>

        <div className="todo-list">
          {visibleTodos.length === 0 ? (
            <div className="empty-state"><span className="empty-icon" aria-hidden="true">✳</span><p>{todos.length === 0 ? 'Your list is a blank page.' : `No ${filter.toLowerCase()} tasks right now.`}</p><span>{todos.length === 0 ? 'Add a task above and take the first step.' : 'Try another filter to see your tasks.'}</span></div>
          ) : visibleTodos.map((todo) => (
            <article className={`todo-row${todo.completed ? ' completed' : ''}`} key={todo.id}>
              <button className="check-button" onClick={() => toggleTodo(todo.id)} aria-label={todo.completed ? `Mark ${todo.title} active` : `Mark ${todo.title} completed`} aria-pressed={todo.completed}>{todo.completed && <span aria-hidden="true">✓</span>}</button>
              <span className="todo-title">{todo.title}</span>
              <button className="delete-button" onClick={() => deleteTodo(todo.id)} aria-label={`Delete ${todo.title}`} title="Delete task">×</button>
            </article>
          ))}
        </div>
        {todos.some((todo) => todo.completed) && <div className="list-footer"><span>A little progress is still progress.</span><button onClick={() => { setTodos((current) => current.filter((todo) => !todo.completed)); setClearMessage(true); }}>{clearMessage ? 'Completed tasks cleared' : 'Clear completed'}</button></div>}
      </section>
      <footer className="page-footer">Made for the things that matter <span>✳</span></footer>
    </main>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => readStoredValue(SESSION_KEY, '') === 'true');
  const [todos, setTodos] = useState(readTodos);

  useEffect(() => {
    writeStoredValue(TODO_KEY, JSON.stringify(todos));
  }, [todos]);

  function login() {
    writeStoredValue(SESSION_KEY, 'true');
    setIsLoggedIn(true);
  }

  function logout() {
    removeStoredValue(SESSION_KEY);
    setIsLoggedIn(false);
  }

  return isLoggedIn ? <TodoApp todos={todos} setTodos={setTodos} onLogout={logout} /> : <Login onLogin={login} />;
}
