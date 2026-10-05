import { StoreProvider, useStore } from './store/store';
import { UIProvider, useUI } from './store/ui';
import { Shell } from './components/Shell';
import { Toasts } from './components/ui';
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { GoalPage } from './pages/GoalPage';
import { MyList } from './pages/MyList';
import { Profile } from './pages/Profile';
import { Activity } from './pages/Activity';
import { HelpModal } from './modals/HelpModal';
import { FundModal } from './modals/FundModal';
import { SponsorModal } from './modals/SponsorModal';
import { PromoteModal, ShareModal } from './modals/PromoteModal';
import { Composer } from './modals/Composer';
import { Celebrate, GuideModal, PersonaModal, RequestModal } from './modals/Misc';

function Page() {
  const { route } = useUI();
  const { me } = useStore();
  switch (route.name) {
    case 'discover':
      return <Discover q={route.q} />;
    case 'goal':
      return <GoalPage key={route.id} id={route.id} />;
    case 'list':
      return me.kind === 'business' ? <Home /> : <MyList />;
    case 'person':
      return <Profile key={route.id} id={route.id} />;
    case 'activity':
      return <Activity key={me.id} />;
    default:
      return <Home />;
  }
}

function ModalHost() {
  const { modal } = useUI();
  const { state } = useStore();
  if (!modal) return null;
  const key = JSON.stringify(modal);
  switch (modal.type) {
    case 'help':
      return <HelpModal key={key} goalId={modal.goalId} mode={modal.mode} friendId={modal.friendId} />;
    case 'fund':
      return <FundModal key={key} goalId={modal.goalId} />;
    case 'sponsor':
      return <SponsorModal key={key} goalId={modal.goalId} />;
    case 'promote': {
      // Already approved? Go straight to the card.
      const approved = state.promotions.find((p) => p.goalId === modal.goalId && p.promoterId === state.me && p.status === 'approved');
      return approved ? <ShareModal key={approved.id} promotionId={approved.id} /> : <PromoteModal key={key} goalId={modal.goalId} />;
    }
    case 'share':
      return <ShareModal key={key} promotionId={modal.promotionId} />;
    case 'composer':
      return <Composer key={key} goalId={modal.goalId} title={modal.title} />;
    case 'celebrate':
      return <Celebrate key={key} goalId={modal.goalId} />;
    case 'persona':
      return <PersonaModal />;
    case 'guide':
      return <GuideModal />;
    case 'request':
      return <RequestModal key={key} kind={modal.kind} goalId={modal.goalId} />;
  }
}

export default function App() {
  return (
    <StoreProvider>
      <UIProvider>
        <Shell>
          <Page />
        </Shell>
        <ModalHost />
        <Toasts />
      </UIProvider>
    </StoreProvider>
  );
}
