import { createContext, useCallback, useContext, useEffect, useMemo, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/* Hash router — tiny on purpose; the prototype has six routes.        */
/* ------------------------------------------------------------------ */

export type Route =
  | { name: 'home' }
  | { name: 'discover'; q?: string }
  | { name: 'list' }
  | { name: 'goal'; id: string }
  | { name: 'person'; id: string }
  | { name: 'activity' };

export function parseHash(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  const params = new URLSearchParams(query);
  switch (parts[0]) {
    case 'discover':
      return { name: 'discover', q: params.get('q') ?? undefined };
    case 'list':
      return { name: 'list' };
    case 'goal':
      return { name: 'goal', id: parts[1] };
    case 'u':
      return { name: 'person', id: parts[1] };
    case 'activity':
      return { name: 'activity' };
    default:
      return { name: 'home' };
  }
}

export function href(r: Route): string {
  switch (r.name) {
    case 'home':
      return '#/';
    case 'discover':
      return r.q ? `#/discover?q=${encodeURIComponent(r.q)}` : '#/discover';
    case 'list':
      return '#/list';
    case 'goal':
      return `#/goal/${r.id}`;
    case 'person':
      return `#/u/${r.id}`;
    case 'activity':
      return '#/activity';
  }
}

/* ------------------------------------------------------------------ */
/* Modals + toasts                                                     */
/* ------------------------------------------------------------------ */

export type Modal =
  | { type: 'help'; goalId: string; mode?: 'self' | 'someone'; friendId?: string }
  | { type: 'fund'; goalId: string }
  | { type: 'sponsor'; goalId: string }
  | { type: 'promote'; goalId: string }
  | { type: 'share'; promotionId: string }
  | { type: 'composer'; goalId?: string; title?: string }
  | { type: 'celebrate'; goalId: string }
  | { type: 'persona' }
  | { type: 'guide' };

interface Toast {
  id: number;
  text: string;
  tone?: 'default' | 'sun';
}

interface UIValue {
  route: Route;
  go: (r: Route) => void;
  back: () => void;
  canGoBack: boolean;
  modal: Modal | null;
  open: (m: Modal) => void;
  close: () => void;
  toasts: Toast[];
  toast: (text: string, tone?: Toast['tone']) => void;
}

const UIContext = createContext<UIValue | null>(null);

/**
 * Routing lives in React state with its own back stack. The URL hash mirrors it when the
 * host allows (replaceState), so deep links work locally — and the app still navigates
 * inside sandboxed frames where history and hash changes are restricted.
 */
export function UIProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>(() => [parseHash(window.location.hash)]);
  const [modal, setModal] = useState<Modal | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const route = stack[stack.length - 1];

  useEffect(() => {
    try {
      const h = href(route);
      if (window.location.hash !== h) history.replaceState(null, '', h);
    } catch {
      /* sandboxed frame — state routing still works */
    }
    window.scrollTo({ top: 0 });
  }, [route]);

  useEffect(() => {
    // manual hash edits / plain anchors
    const onHash = () => {
      const r = parseHash(window.location.hash);
      setStack((st) => (href(st[st.length - 1]) === href(r) ? st : [...st, r]));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((r: Route) => {
    setStack((st) => (href(st[st.length - 1]) === href(r) ? [...st.slice(0, -1), r] : [...st.slice(-30), r]));
  }, []);
  const back = useCallback(() => setStack((st) => (st.length > 1 ? st.slice(0, -1) : [{ name: 'discover' }])), []);

  const toast = useCallback((text: string, tone: Toast['tone'] = 'default') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const value = useMemo(
    () => ({ route, go, back, canGoBack: stack.length > 1, modal, open: setModal, close: () => setModal(null), toasts, toast }),
    [route, go, back, stack.length, modal, toasts, toast],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

/** An anchor that routes in-app (keeps a real href for accessibility and new-tab use). */
export function Link({ to, children, ...rest }: { to: Route; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const { go } = useUI();
  return (
    <a
      href={href(to)}
      {...rest}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        go(to);
      }}
    >
      {children}
    </a>
  );
}

export function useUI() {
  const v = useContext(UIContext);
  if (!v) throw new Error('useUI outside provider');
  return v;
}
