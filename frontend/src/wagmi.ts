import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {

  mainnet,
  arbitrum,
  base,
  linea,
  bsc,
  optimism,
  polygon,
  arbitrumSepolia, //test net
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'GUSEUL',
  projectId: '708a7972c5c351044747356a16e6eb70',
  chains: [
    mainnet,
    arbitrum,
    base,
    linea,
    bsc,
    optimism,
    polygon,
    arbitrumSepolia
  ],
  ssr: true,
});
