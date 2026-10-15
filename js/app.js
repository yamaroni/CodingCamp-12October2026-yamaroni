// Life Dashboard — single-file vanilla JS application.
//
// Architecture (see design.md): four self-contained feature modules share a
// small set of helpers. Each module owns its in-memory state, its slice of
// Local Storage, and its own rendering. On DOMContentLoaded the four modules
// are initialized in order.
//
// This file is the scaffold: module stubs plus the init wiring. Helper and
// module logic are filled in by later tasks.

'use strict';

/* ------------------------------------------------------------------ *
 * Shared helpers
 * ------------------------------------------------------------------ */

// `dom` — tiny declarative DOM builders. Rendering constructs real nodes via
// direct DOM APIs and sets user-provided text through textContent / text
// nodes, so user data is never interpreted as markup (never innerHTML).
const dom = {
  // el(tag, props, children) — create an element.
  //   tag:      element tag name, e.g. 'button'.
  //   props:    optional object of properties/attributes:
  //             - className / id / textContent / type / value / etc. set as
  //               element properties when the property exists on the node;
  //             - 'on*' keys (e.g. onClick) and function values bind events;
  //             - a `dataset` object sets data-* attributes;
  //             - everything else is set with setAttribute.
  //   children: optional string, Node, or array of strings/Nodes. Strings
  //             become text nodes (safe), Nodes are appended as-is.
  el(tag, props, children) {
    const node = document.createElement(tag);

    if (props) {
      for (const key of Object.keys(props)) {
        const value = props[key];
        if (value == null) continue;

        if (key === 'dataset' && typeof value === 'object') {
          for (const dataKey of Object.keys(value)) {
            node.dataset[dataKey] = value[dataKey];
          }
        } else if (key.startsWith('on') && typeof value === 'function') {
          // onClick -> 'click', onInput -> 'input', etc.
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key in node) {
          node[key] = value;
        } else {
          node.setAttribute(key, value);
        }
      }
    }

    if (children != null) {
      const list = Array.isArray(children) ? children : [children];
      for (const child of list) {
        if (child == null) continue;
        node.appendChild(
          child instanceof Node ? child : document.createTextNode(String(child))
        );
      }
    }

    return node;
  },

  // clear(node) — remove all child nodes from `node`.
  clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    return node;
  },
};

// `notify` — scoped status/error messaging. Each feature section owns a
// dedicated message area (`<p class="message" role="status" aria-live>` in
// index.html). Messages are written as plain text via textContent, so user
// data can never be interpreted as markup. Modules clear the message on the
// next successful action.
const notify = {
  // message(areaEl, text) — write plain-text `text` into the given message
  //   area element. A null/empty text clears the area. `areaEl` may be the
  //   element itself or an element id string.
  message(areaEl, text) {
    const node = typeof areaEl === 'string'
      ? document.getElementById(areaEl)
      : areaEl;
    if (!node) return;
    node.textContent = text == null ? '' : String(text);
  },

  // clear(areaEl) — empty the given message area.
  clear(areaEl) {
    this.message(areaEl, '');
  },
};

// Local Storage keys. Each persistent module owns exactly one key; defined
// here so modules (and later tasks) share a single source of truth.
//   TASKS_KEY — owned by TodoListModule   (Task[] as JSON)
//   LINKS_KEY — owned by QuickLinksModule (Quick_Link[] as JSON)
const TASKS_KEY = 'tldd.tasks';
const LINKS_KEY = 'tldd.links';

// `storage` — thin, fail-soft wrapper over the Local Storage API. Local
// Storage can be unavailable (private mode, disabled, quota full), so every
// method is defensive and NEVER throws to its caller: reads/writes return a
// result object `{ ok, ... }` and `isAvailable` returns a boolean. Callers
// preserve their in-memory state and surface an error via `notify` when a
// result is not ok (Req 12.6). All persistent data is stored here — there is
// no backend (Req 12.2).
const storage = {
  // KEYS — the storage keys owned by the persistent modules, exposed so
  // callers can reference them off the helper as well as via the top-level
  // TASKS_KEY / LINKS_KEY constants.
  KEYS: {
    TASKS: TASKS_KEY,
    LINKS: LINKS_KEY,
  },

  // isAvailable() — feature-detect Local Storage by writing and removing a
  // probe key inside try/catch. Returns true only when both succeed; any
  // thrown error (storage disabled, blocked, or quota-full) yields false.
  isAvailable() {
    const probe = '__tldd_probe__';
    try {
      localStorage.setItem(probe, probe);
      localStorage.removeItem(probe);
      return true;
    } catch (err) {
      return false;
    }
  },

  // readJSON(key) — read and JSON-parse the value at `key`.
  //   Success:  { ok: true, value } where value is the parsed data.
  //   Failure:  { ok: false, reason } with a descriptive reason string:
  //             - 'unavailable' — localStorage.getItem threw (storage blocked);
  //             - 'missing'     — the key is absent (null);
  //             - 'parse-error' — the stored value is not valid JSON.
  //   The distinct reasons let callers tell a missing key (expected, no error)
  //   from a parse failure (surface an error) — see Req 8.3 vs 8.4.
  readJSON(key) {
    let raw;
    try {
      raw = localStorage.getItem(key);
    } catch (err) {
      return { ok: false, reason: 'unavailable' };
    }

    if (raw == null) {
      return { ok: false, reason: 'missing' };
    }

    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch (err) {
      return { ok: false, reason: 'parse-error' };
    }
  },

  // writeJSON(key, value) — JSON-serialize `value` and store it at `key`.
  //   Success:  { ok: true }.
  //   Failure:  { ok: false, reason } when serialization or setItem throws:
  //             - 'serialize-error' — value could not be stringified;
  //             - 'unavailable'     — setItem threw (quota full, disabled, or
  //               otherwise unavailable).
  //   Callers keep their in-memory state and show an error on failure (Req 12.6).
  writeJSON(key, value) {
    let raw;
    try {
      raw = JSON.stringify(value);
    } catch (err) {
      return { ok: false, reason: 'serialize-error' };
    }

    try {
      localStorage.setItem(key, raw);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: 'unavailable' };
    }
  },
};

/* ------------------------------------------------------------------ *
 * Feature modules (empty stubs — implemented in later tasks)
 * ------------------------------------------------------------------ */

const GreetingModule = {
  init() {
    // Implemented in task 3.
  },
};

const FocusTimerModule = {
  init() {
    // Implemented in task 4.
  },
};

const TodoListModule = {
  init() {
    // Implemented in task 6.
  },
};

const QuickLinksModule = {
  init() {
    // Implemented in task 8.
  },
};

/* ------------------------------------------------------------------ *
 * Entry point: initialize the four modules in order.
 * ------------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  GreetingModule.init();
  FocusTimerModule.init();
  TodoListModule.init();
  QuickLinksModule.init();
});
