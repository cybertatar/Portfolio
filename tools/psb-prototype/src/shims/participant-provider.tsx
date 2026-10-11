import { createContext, useContext, useState, type ReactNode } from 'react';

const initialState = {
  cashbackConnected: true,
  selectedCashbackCategories: ['На все покупки', 'Авиабилеты', 'Транспорт'],
  nextMonthCashbackCategories: [],
  nextMonthCashbackSelectionStatus: 'available',
  cardDetailsRevealed: false,
  cashbackSuccessVisible: false,
  accountsHidden: false,
  dismissedHomePromos: [],
  homeHistoryCollapsed: false,
  homeCurrencyCollapsed: false,
};

// An empty participant code makes the header show the default profile name
const researchState = { participantCode: '' };

const Context = createContext<any>(null);

export function PortfolioProvider({
  children,
  initiallyConnected = true,
}: {
  children: ReactNode;
  initiallyConnected?: boolean;
}) {
  const [productState, setProductState] = useState(() => ({
    ...initialState,
    cashbackConnected: initiallyConnected,
  }));
  const updateProductState = (patch: Record<string, unknown>) =>
    setProductState((current) => ({ ...current, ...patch }));
  return (
    <Context.Provider
      value={{ productState, updateProductState, replayVisualState: null, researchState }}
    >
      {children}
    </Context.Provider>
  );
}

export function useParticipant() {
  const value = useContext(Context);
  if (!value) throw new Error('PortfolioProvider is missing');
  return value;
}
