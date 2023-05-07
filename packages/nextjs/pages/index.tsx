import { ChangeEvent, useState } from "react";
import Head from "next/head";
import { ethers } from "ethers";
import type { NextPage } from "next";
import Curve from "~~/components/challenge/Curve";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useAccountBalance, useDeployedContractInfo, useScaffoldContractRead } from "~~/hooks/scaffold-eth";

// REGEX for number inputs (only allow numbers and a single decimal point)
export const NUMBER_REGEX = /^\.?\d+\.?\d*$/;

const initialState = {
  ethToToken: "0",
  tokenToEth: "0",
};

const Home: NextPage = () => {
  const [form, setForm] = useState(initialState);
  console.log("⚡️ ~ file: index.tsx:16 ~ form:", form);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prevFormState => ({ ...prevFormState, [name]: value }));
  };

  const { data: DEXContract } = useDeployedContractInfo("DEX");
  const { data: dexBalloonsBalance } = useScaffoldContractRead({
    contractName: "Balloons",
    functionName: "balanceOf",
    args: [DEXContract?.address],
  });
  const { data: totalLiquidity } = useScaffoldContractRead({
    contractName: "DEX",
    functionName: "totalLiquidity",
  });
  const { balance: dexContractBalance } = useAccountBalance(DEXContract?.address);

  return (
    <>
      <Head>
        <title>Scaffold-ETH 2 App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth-2" />
      </Head>
      {/* Container */}
      <div className="p-4 flex">
        {/* Form and Contract Details */}
        <div className="flex flex-col">
          {/*  DEX  details */}
          <div className="flex flex-col space-y-2">
            <p className="my-0 text-2xl text-center">DEX Contract</p>
            <div className="flex space-x-4">
              <Address address={DEXContract?.address} />
              <div className="flex items-center">
                <p className="py-0 text-lg my-0">⚖️</p>
                <Balance address={DEXContract?.address} />
              </div>
              <div className="flex items-center space-x-2">
                <p className="my-0 text-lg">🎈</p>
                {dexBalloonsBalance && <p className="py-0 text-lg">{ethers.utils.formatEther(dexBalloonsBalance)}</p>}
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              {/* ETH to Token */}
              <div className="flex items-center space-x-4">
                <p className="my-0 text-lg">ethToToken</p>
                <div className="rounded-2xl border-2 border-base-300">
                  <div className="form-control grow">
                    <div className="flex w-full items-center">
                      <input
                        name="ethToToken"
                        value={form.ethToToken}
                        onChange={handleInputChange}
                        // value={tokenValue3}
                        // onChange={e => setTokenValue3(e.target.value)}
                        type="text"
                        placeholder="0.00"
                        className="input input-ghost pl-3 focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400 grow"
                      />
                      <div className="btn bg-primary text-white btn-sm border-none rounded-2xl m-0 text-2xl">💸</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Token to ETH */}
              <div className="flex items-center space-x-4">
                <p className="my-0 text-lg">tokenToEth</p>
                <div className="rounded-2xl border-2 border-base-300">
                  <div className="form-control grow">
                    <div className="flex w-full items-center">
                      <input
                        name="tokenToEth"
                        value={form.tokenToEth}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        type="text"
                        className="input input-ghost pl-3 focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400 grow"
                      />
                      <div className="btn bg-primary text-white btn-sm border-none rounded-2xl text-2xl">🔏</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="divider">Liquidity ({totalLiquidity && ethers.utils.formatEther(totalLiquidity)})</div>
        </div>
        {/* Curve */}
        <div>
          <Curve
            addingEth={NUMBER_REGEX.test(form.ethToToken) ? form.ethToToken : 0}
            addingToken={NUMBER_REGEX.test(form.tokenToEth) ? form.tokenToEth : 0}
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
