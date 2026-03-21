import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrumSepolia,
  sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'GUSEUL',
  projectId: 'YOUR',
  chains: [
    arbitrumSepolia
  ],
  ssr: true,
});
