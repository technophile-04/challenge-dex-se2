import { ChangeEvent, useState } from "react";
import Head from "next/head";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ChallengeInput } from "~~/components/challenge/ChallengeInputs";
import Curve from "~~/components/challenge/Curve";
import { Address, AddressInput, Balance, IntegerInput, displayTxResult } from "~~/components/scaffold-eth";
import {
  useAccountBalance,
  useDeployedContractInfo,
  useScaffoldContractRead,
  useScaffoldContractWrite,
} from "~~/hooks/scaffold-eth";

// REGEX for number inputs (only allow numbers and a single decimal point)
export const NUMBER_REGEX = /^\.?\d+\.?\d*$/;

const dexInitialFormState = {
  ethToToken: "0",
  tokenToEth: "0",
  deposit: "0",
  withdraw: "0",
};

const balloonInitialFormState = {
  approveValue: "0",
  approveAddress: "",
  balanceOfAddress: "",
};

const Home: NextPage = () => {
  const [dexForm, setDexForm] = useState(dexInitialFormState);
  const [balloonsForm, setBalloonsForm] = useState(balloonInitialFormState);

  console.log("⚡️ ~ file: index.tsx:16 ~ form:", dexForm);

  const { address } = useAccount();

  const { data: DEXContract } = useDeployedContractInfo("DEX");
  const { data: balloonsContract } = useDeployedContractInfo("Balloons");

  // ----DEX READS----
  const { balance: dexContractBalance } = useAccountBalance(DEXContract?.address);

  const { data: totalLiquidity } = useScaffoldContractRead({
    contractName: "DEX",
    functionName: "totalLiquidity",
  });

  // ----DEX WRITES----
  const { writeAsync: writeDeposit } = useScaffoldContractWrite({
    contractName: "DEX",
    functionName: "deposit",
    value: NUMBER_REGEX.test(dexForm.deposit) ? dexForm.deposit : undefined,
  });

  // ----BALLOONS READS----
  const { data: dexBalloonsBalance } = useScaffoldContractRead({
    contractName: "Balloons",
    functionName: "balanceOf",
    args: [DEXContract?.address],
  });
  const { data: inputAddressBalloonsBalance, isFetching: isInputBalloonsBalanceFetching } = useScaffoldContractRead({
    contractName: "Balloons",
    functionName: "balanceOf",
    args: [balloonsForm.balanceOfAddress],
  });

  const { data: connectedAccountAllowance } = useScaffoldContractRead({
    contractName: "Balloons",
    functionName: "allowance",
    args: [address, DEXContract?.address],
  });

  // ----BALLOONS WRITES----
  const { writeAsync: writeApprove } = useScaffoldContractWrite({
    contractName: "Balloons",
    functionName: "approve",
    args: [
      // TODO : Fix this (This will break in some cases)
      // Had to add 1 wei because allowance fail while depositing
      DEXContract?.address,
      NUMBER_REGEX.test(dexForm.deposit) ? ethers.utils.parseEther(dexForm.deposit).add("1") : undefined,
    ],
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDexForm(prevFormState => ({ ...prevFormState, [name]: value }));
  };

  return (
    <>
      <Head>
        <title>Scaffold-ETH 2 App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth-2" />
      </Head>
      {/* Container */}
      <div className="p-4 flex justify-center space-x-20">
        {/* Form and Contract Details */}
        <div className="flex flex-col space-y-4">
          {/*  DEX  details */}
          <div className="flex flex-col space-y-3 bg-base-300 p-8 rounded-2xl shadow-xl">
            <p className="my-0 text-2xl text-center">DEX Contract</p>
            <div className="flex space-x-4">
              <Address address={DEXContract?.address} />
              <div className="flex items-center">
                <p className="py-0 text-lg my-0">⚖️</p>
                <Balance address={DEXContract?.address} />
              </div>
              <div className="flex items-center space-x-2">
                <p className="my-0 text-lg">🎈</p>
                {dexBalloonsBalance && (
                  <p className="py-0 text-lg">{parseFloat(ethers.utils.formatEther(dexBalloonsBalance)).toFixed(3)}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              {/* ETH to Token */}
              <ChallengeInput
                label="ethToToken"
                value={dexForm.ethToToken}
                onChange={handleInputChange}
                name="ethToToken"
                buttonIcon="💸"
                buttonOnClick={() => {
                  return;
                }}
              />
              {/* Token to ETH */}
              <ChallengeInput
                label="tokenToEth"
                value={dexForm.tokenToEth}
                onChange={handleInputChange}
                name="tokenToEth"
                buttonIcon="🔏"
                buttonOnClick={() => {
                  return;
                }}
              />
            </div>
            <div className="divider">
              Liquidity ({totalLiquidity && parseFloat(ethers.utils.formatEther(totalLiquidity))})
            </div>
            <div className="flex flex-col space-y-3">
              {/* Deposit Input*/}
              <ChallengeInput
                label="Deposit"
                value={dexForm.deposit}
                onChange={handleInputChange}
                name="deposit"
                buttonIcon="📤"
                buttonOnClick={async () => {
                  const depositAmount = NUMBER_REGEX.test(dexForm.deposit)
                    ? ethers.utils.parseEther(dexForm.deposit)
                    : undefined;
                  if (!depositAmount) return;
                  if (connectedAccountAllowance && connectedAccountAllowance.lt(depositAmount)) await writeApprove();

                  await writeDeposit();
                }}
              />
              {/* Withdraw Input*/}
              <ChallengeInput
                label="Withdraw"
                value={dexForm.withdraw}
                onChange={handleInputChange}
                name="withdraw"
                buttonIcon="📤"
                buttonOnClick={() => {
                  return;
                }}
              />
            </div>
          </div>
          {/* Balloons details */}
          <div className="flex flex-col space-y-3 bg-base-300 p-8 rounded-2xl shadow-xl">
            <p className="my-0 text-2xl text-center">Balloons Contract</p>
            <div className="flex justify-center">
              <Address address={balloonsContract?.address} />
            </div>
            <div className="flex flex-col space-y-3">
              <div className="flex items-start space-x-8">
                <p className="my-0 text-lg">approve</p>
                <div className="flex flex-col space-y-2">
                  <div className="border-2 border-base-100 rounded-3xl">
                    <IntegerInput
                      value={balloonsForm.approveValue}
                      onChange={newApproveValue => {
                        // @ts-expect-error TODO: Fix this
                        setBalloonsForm(prevFormState => ({ ...prevFormState, approveValue: newApproveValue }));
                      }}
                    />
                  </div>
                  <div className="border-2 border-base-100 rounded-3xl">
                    <AddressInput
                      placeholder="address"
                      value={balloonsForm.approveAddress}
                      onChange={newAddress =>
                        setBalloonsForm(prevFormState => ({ ...prevFormState, approveAddress: newAddress }))
                      }
                    />
                  </div>
                  <div className="btn btn-primary btn-sm self-end">Send 💸</div>
                </div>
              </div>
              <div className="flex items-start space-x-8">
                <p className="my-0 text-lg">balanceOf</p>
                <div className="flex flex-col space-y-2">
                  <div className="border-2 border-base-100 rounded-3xl">
                    <AddressInput
                      placeholder="address"
                      value={balloonsForm.balanceOfAddress}
                      onChange={newAddress =>
                        setBalloonsForm(prevFormState => ({ ...prevFormState, balanceOfAddress: newAddress }))
                      }
                    />
                  </div>
                  <div className="flex justify-between gap-2">
                    <div className="flex-grow">
                      {inputAddressBalloonsBalance !== null && inputAddressBalloonsBalance !== undefined && (
                        <span className="block bg-secondary rounded-3xl text-sm px-4 py-1.5">
                          <strong>Result</strong>: {displayTxResult(inputAddressBalloonsBalance)}
                        </span>
                      )}
                    </div>
                    <button className={`btn btn-secondary btn-sm ${isInputBalloonsBalanceFetching ? "loading" : ""}`}>
                      Read 📡
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Curve */}
        <div>
          <Curve
            addingEth={NUMBER_REGEX.test(dexForm.ethToToken) ? dexForm.ethToToken : 0}
            addingToken={NUMBER_REGEX.test(dexForm.tokenToEth) ? dexForm.tokenToEth : 0}
            ethReserve={dexContractBalance && parseFloat("" + dexContractBalance)}
            tokenReserve={dexBalloonsBalance && parseFloat(ethers.utils.formatEther(dexBalloonsBalance))}
            width={500}
            height={500}
          />
        </div>
      </div>
    </>
  );
};

export default Home;
