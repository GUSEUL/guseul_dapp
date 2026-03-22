import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrumSepolia,
  mainnet,
  polygon,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'GUSEUL',
  projectId: '708a7972c5c351044747356a16e6eb70',
  chains: [
    arbitrumSepolia,
    mainnet,
    polygon
  ],
  ssr: true,
});
