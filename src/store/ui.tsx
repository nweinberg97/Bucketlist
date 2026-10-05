import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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
  modal: Modal | null;
  open: (m: Modal) => void;
  close: () => void;
  toasts: Toast[];
  toast: (text: string, tone?: Toast['tone']) => void;
}

const UIContext = createContext<UIValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [modal, setModal] = useState<Modal | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((r: Route) => {
    const h = href(r);
    if (window.location.hash === h) setRoute(parseHash(h));
    else window.location.hash = h;
  }, []);

  const toast = useCallback((text: string, tone: Toast['tone'] = 'default') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const value = useMemo(
    () => ({ route, go, modal, open: setModal, close: () => setModal(null), toasts, toast }),
    [route, go, modal, toasts, toast],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const v = useContext(UIContext);
  if (!v) throw new Error('useUI outside provider');
  return v;
}
