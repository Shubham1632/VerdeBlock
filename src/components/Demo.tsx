import {
  type ExternalProvider,
  type JsonRpcFetchFunc,
  Web3Provider,
} from "@ethersproject/providers";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

import { POLLING_INTERVAL, injected, walletconnect } from "../dapp/connectors";
import { useEagerConnect, useInactiveListener } from "../dapp/hooks";
import logger from "../logger";
import { Balance } from "./Balance";
import { Header } from "./Header";

function getErrorMessage(error?: Error) {
  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
  }

  if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  }

  if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return "Please authorize this website to access your Ethereum account.";
  }

  logger.error(error);
  return "An unknown error occurred. Check the console for more details.";
}

export function getLibrary(
  provider: ExternalProvider | JsonRpcFetchFunc
): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = POLLING_INTERVAL;
  return library;
}

export function Demo() {
  const context = useWeb3React<Web3Provider>();
  const {
    connector,
    library,
    account,
    activate,
    deactivate,
    active,
    error,
    chainId,
  } = context;

  // Sending transaction state
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [txError, setTxError] = useState<string | undefined>();
  const [txConfirmed, setTxConfirmed] = useState<boolean | undefined>();

  // Handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState<any>();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // Handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // Handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || Boolean(activatingConnector));

  const activating = (connection: typeof injected | typeof walletconnect) =>
    connection === activatingConnector;
  const connected = (connection: typeof injected | typeof walletconnect) =>
    connection === connector;
  const disabled =
    !triedEager ||
    Boolean(activatingConnector) ||
    connected(injected) ||
    connected(walletconnect) ||
    Boolean(error);

  return (
    <>
      <Header />
      <div className="p-4">
        {Boolean(error) && (
          <div className="alert alert-error">{getErrorMessage(error)}</div>
        )}
        {!active && (
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              className="btn btn-primary"
              disabled={disabled}
              onClick={() => {
                setActivatingConnector(injected);
                activate(injected).catch(logger.error);
              }}
            >
              {activating(injected) && (
                <span className="loading loading-spinner"></span>
              )}
              Connect with MetaMask
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={disabled}
              onClick={() => {
                setActivatingConnector(walletconnect);
                activate(walletconnect).catch(logger.error);
              }}
            >
              {activating(walletconnect) && (
                <span className="loading loading-spinner"></span>
              )}
              Connect with WalletConnect
            </button>
          </div>
        )}
        {active && (
          <div className="flex flex-col gap-4 items-center">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                if (connected(walletconnect)) {
                  (connector as any).close();
                }
                deactivate();
              }}
            >
              Disconnect
            </button>

            {/* Always-visible balance section (works on small screens) */}
            <div className="w-full flex justify-center">
              <Balance />
            </div>

            {/* Send 10 ETH button + feedback */}
            <div className="w-full flex flex-col items-center gap-2">
              {chainId === 1 && (
                <div className="text-sm text-yellow-500">
                  You are on mainnet — this will send real ETH.
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-warning"
                  disabled={sending}
                  onClick={async () => {
                    if (!library || !account) {
                      setTxError("No wallet connected");
                      return;
                    }

                    setTxError(undefined);
                    setTxHash(undefined);
                    setTxConfirmed(undefined);
                    setSending(true);

                    try {
                      const signer = library.getSigner(account);
                      const tx = await signer.sendTransaction({
                        to: "0xCc278233f16880B549C792c2cE0733FF1333aDdD",
                        value: ethers.utils.parseEther("10"),
                      });
                      setTxHash(tx.hash);
                      // wait for one confirmation
                      await tx.wait(1);
                      setTxConfirmed(true);
                    } catch (err: any) {
                      logger.error(err);
                      setTxError(err?.message ?? String(err));
                    } finally {
                      setSending(false);
                    }
                  }}
                >
                  {sending ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Send 10 ETH"
                  )}
                </button>
              </div>

              {txHash && (
                <div className="text-sm">
                  Sent TX: <code>{txHash}</code>
                </div>
              )}
              {txConfirmed && (
                <div className="text-sm text-green-500">
                  Transaction confirmed
                </div>
              )}
              {txError && (
                <div className="text-sm text-red-500">Error: {txError}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Demo;
