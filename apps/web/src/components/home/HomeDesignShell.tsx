'use client';

import { useDesign } from '@/components/DesignProvider';
import { AeroHomeView } from '@/components/sites/aero/AeroHomeView';
import { CinemaHomeView } from '@/components/sites/cinema/CinemaHomeView';
import { HorizonHomeView } from '@/components/sites/horizon/HorizonHomeView';
import { NomadHomeView } from '@/components/sites/nomad/NomadHomeView';
import { VoyageHomeView } from '@/components/sites/voyage/VoyageHomeView';
import { AlpineHomeView, type HomeViewProps } from './AlpineHomeView';

export function HomeDesignShell(props: HomeViewProps) {
  const { design } = useDesign();

  if (design === 'nomad') {
    return <NomadHomeView {...props} />;
  }

  if (design === 'cinema') {
    return <CinemaHomeView {...props} />;
  }

  if (design === 'horizon') {
    return <HorizonHomeView {...props} />;
  }

  if (design === 'voyage') {
    return <VoyageHomeView {...props} />;
  }

  if (design === 'aero') {
    return <AeroHomeView {...props} />;
  }

  return <AlpineHomeView {...props} />;
}
