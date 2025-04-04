"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  const { data: nextTokenId } = useScaffoldReadContract({
    contractName: "ShipOfTheseusNFT",
    functionName: "nextTokenId",
  });

  const { data: tokenURI } = useScaffoldReadContract({
    contractName: "ShipOfTheseusNFT",
    functionName: "tokenURI",
    args: [selectedTokenId ? BigInt(selectedTokenId) : undefined],
    query: {
      enabled: selectedTokenId !== null,
    },
  });

  const { data: paradoxScore } = useScaffoldReadContract({
    contractName: "ShipOfTheseusNFT",
    functionName: "paradoxScore",
    args: [selectedTokenId ? BigInt(selectedTokenId) : undefined],
    query: {
      enabled: selectedTokenId !== null,
    },
  });

  const { writeContractAsync: mint } = useScaffoldWriteContract({
    contractName: "ShipOfTheseusNFT",
  });

  const { writeContractAsync: autoReverse } = useScaffoldWriteContract({
    contractName: "ShipOfTheseusNFT",
  });

  const { writeContractAsync: restoreOriginal } = useScaffoldWriteContract({
    contractName: "ShipOfTheseusNFT",
  });

  return (
    <div className="flex flex-col flex-grow pt-10">
      <div className="px-5 max-w-6xl mx-auto">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">Ship of Theseus NFT</span>
          <span className="block text-2xl mt-2">A Philosophical NFT Experiment</span>
        </h1>

        {/* Mint Section */}
        <div className="bg-base-100 shadow-xl rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create Your Ship</h2>
          <p className="mb-4">Mint a new Ship of Theseus NFT and begin your philosophical journey.</p>
          <button className="btn btn-primary" onClick={() => mint({ functionName: "mint" })}>
            Mint
          </button>
          {nextTokenId && <p className="mt-2 text-sm">Next Token ID: {nextTokenId.toString()}</p>}
        </div>

        {/* Token Selection */}
        <div className="bg-base-100 shadow-xl rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">View Your Ship</h2>
          <div className="flex gap-4 items-end">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Enter Token ID</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={selectedTokenId === null ? "" : selectedTokenId}
                onChange={e => {
                  const value = e.target.value === "" ? null : parseInt(e.target.value);
                  setSelectedTokenId(value);
                }}
                min="0"
              />
            </div>
            <button
              className="btn btn-primary"
              disabled={selectedTokenId === null}
              onClick={() => {
                if (selectedTokenId !== null && nextTokenId && BigInt(selectedTokenId) >= nextTokenId) {
                  alert("Token does not exist yet");
                  return;
                }
              }}
            >
              View Ship
            </button>
          </div>
        </div>

        {/* Ship Display */}
        {selectedTokenId !== null && tokenURI && (
          <div className="bg-base-100 shadow-xl rounded-3xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Ship #{selectedTokenId}</h2>
              <div className="badge badge-primary">Paradox Score: {paradoxScore?.toString()}</div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Current State</h3>
                <div className="bg-base-200 rounded-xl p-4">
                  <pre className="whitespace-pre-wrap">
                    {tokenURI &&
                      (() => {
                        try {
                          if (tokenURI.startsWith("data:application/json;base64,")) {
                            // Extract and decode the base64 part
                            const base64Data = tokenURI.split(",")[1];
                            const jsonStr = atob(base64Data);
                            return JSON.stringify(JSON.parse(jsonStr), null, 2);
                          } else {
                            // Try direct parsing if not a data URL
                            return JSON.stringify(JSON.parse(tokenURI as string), null, 2);
                          }
                        } catch (e) {
                          // Fallback to showing the raw data if parsing fails
                          return `Raw token data: ${tokenURI}`;
                        }
                      })()}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Actions</h3>
                <div className="space-y-4">
                  <button
                    className="btn btn-secondary w-full"
                    onClick={() =>
                      autoReverse({
                        functionName: "autoReverse",
                        args: [BigInt(selectedTokenId!)],
                      })
                    }
                  >
                    Auto Reverse
                  </button>
                  <button
                    className="btn btn-accent w-full"
                    onClick={() =>
                      restoreOriginal({
                        functionName: "restoreOriginal",
                        args: [BigInt(selectedTokenId!)],
                      })
                    }
                  >
                    Restore Original
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Philosophical Context */}
        <div className="bg-base-100 shadow-xl rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-4">The Paradox</h2>
          <p className="text-lg mb-4">
            The Ship of Theseus is a thought experiment that raises the question of whether an object that has had all
            of its components replaced remains fundamentally the same object.
          </p>
          <p className="text-lg">
            In this NFT implementation, your ship transforms with each transfer, gradually replacing its parts. The
            paradox score tracks how much of the original ship remains, while the auto-reverse feature lets you explore
            the concept of identity through time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
