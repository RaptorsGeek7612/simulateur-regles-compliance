import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import OnchainID from '@onchain-id/solidity';
import * as fs from 'fs';

async function deployIdentityProxy(implementationAuthority: string, managementKey: string, signer: any) {
  const identity = await new ethers.ContractFactory(OnchainID.contracts.IdentityProxy.abi, OnchainID.contracts.IdentityProxy.bytecode, signer).deploy(
    implementationAuthority,
    managementKey,
  );
  return ethers.getContractAt('Identity', identity.address, signer);
}

async function main() {
  const [deployer, tokenIssuer, tokenAgent, tokenAdmin, claimIssuer, aliceWallet, bobWallet, charlieWallet, daveWallet] = await ethers.getSigners();
  const claimIssuerSigningKey = ethers.Wallet.createRandom();

  const claimTopicsRegistryImplementation = await ethers.deployContract('ClaimTopicsRegistry', deployer);
  const trustedIssuersRegistryImplementation = await ethers.deployContract('TrustedIssuersRegistry', deployer);
  const identityRegistryStorageImplementation = await ethers.deployContract('IdentityRegistryStorage', deployer);
  const identityRegistryImplementation = await ethers.deployContract('IdentityRegistry', deployer);
  const modularComplianceImplementation = await ethers.deployContract('ModularCompliance', deployer);
  const tokenImplementation = await ethers.deployContract('Token', deployer);
  const identityImplementation = await new ethers.ContractFactory(
    OnchainID.contracts.Identity.abi,
    OnchainID.contracts.Identity.bytecode,
    deployer,
  ).deploy(deployer.address, true);

  const identityImplementationAuthority = await new ethers.ContractFactory(
    OnchainID.contracts.ImplementationAuthority.abi,
    OnchainID.contracts.ImplementationAuthority.bytecode,
    deployer,
  ).deploy(identityImplementation.address);

  const trexImplementationAuthority = await ethers.deployContract(
    'TREXImplementationAuthority',
    [true, ethers.constants.AddressZero, ethers.constants.AddressZero],
    deployer,
  );
  const versionStruct = { major: 4, minor: 0, patch: 0 };
  const contractsStruct = {
    tokenImplementation: tokenImplementation.address,
    ctrImplementation: claimTopicsRegistryImplementation.address,
    irImplementation: identityRegistryImplementation.address,
    irsImplementation: identityRegistryStorageImplementation.address,
    tirImplementation: trustedIssuersRegistryImplementation.address,
    mcImplementation: modularComplianceImplementation.address,
  };
  await trexImplementationAuthority.connect(deployer).addAndUseTREXVersion(versionStruct, contractsStruct);

  const claimTopicsRegistry = await ethers
    .deployContract('ClaimTopicsRegistryProxy', [trexImplementationAuthority.address], deployer)
    .then((proxy) => ethers.getContractAt('ClaimTopicsRegistry', proxy.address));

  const trustedIssuersRegistry = await ethers
    .deployContract('TrustedIssuersRegistryProxy', [trexImplementationAuthority.address], deployer)
    .then((proxy) => ethers.getContractAt('TrustedIssuersRegistry', proxy.address));

  const identityRegistryStorage = await ethers
    .deployContract('IdentityRegistryStorageProxy', [trexImplementationAuthority.address], deployer)
    .then((proxy) => ethers.getContractAt('IdentityRegistryStorage', proxy.address));

  const identityRegistry = await ethers
    .deployContract(
      'IdentityRegistryProxy',
      [trexImplementationAuthority.address, trustedIssuersRegistry.address, claimTopicsRegistry.address, identityRegistryStorage.address],
      deployer,
    )
    .then((proxy) => ethers.getContractAt('IdentityRegistry', proxy.address));

  const compliance = await ethers.deployContract('ModularCompliance', deployer);
  await compliance.connect(deployer).init();

  const countryAllowModule = await ethers.deployContract('CountryAllowModule', deployer);
  await compliance.connect(deployer).addModule(countryAllowModule.address);
  // N'autorise que le pays 42 : Alice et Dave (pays 42) passent, Bob (pays
  // 666) est bloqué par ce module réel — un cas "allow" et un cas "deny"
  // prêts à l'emploi pour la démo.
  const allowCountriesCalldata = countryAllowModule.interface.encodeFunctionData('batchAllowCountries', [[42]]);
  await compliance.connect(deployer).callModuleFunction(allowCountriesCalldata, countryAllowModule.address);

  const tokenOID = await deployIdentityProxy(identityImplementationAuthority.address, tokenIssuer.address, deployer);
  const tokenName = 'Simulateur Demo Token';
  const tokenSymbol = 'SIMT';
  const tokenDecimals = BigNumber.from('18');
  const token = await ethers
    .deployContract(
      'TokenProxy',
      [trexImplementationAuthority.address, identityRegistry.address, compliance.address, tokenName, tokenSymbol, tokenDecimals, tokenOID.address],
      deployer,
    )
    .then((proxy) => ethers.getContractAt('Token', proxy.address));

  await compliance.connect(deployer).bindToken(token.address);
  await identityRegistryStorage.connect(deployer).bindIdentityRegistry(identityRegistry.address);
  await token.connect(deployer).addAgent(tokenAgent.address);

  const claimTopics = [ethers.utils.id('KYC_CLAIM')];
  await claimTopicsRegistry.connect(deployer).addClaimTopic(claimTopics[0]);

  const claimIssuerContract = await ethers.deployContract('ClaimIssuer', [claimIssuer.address], claimIssuer);
  await claimIssuerContract
    .connect(claimIssuer)
    .addKey(ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [claimIssuerSigningKey.address])), 3, 1);
  await trustedIssuersRegistry.connect(deployer).addTrustedIssuer(claimIssuerContract.address, claimTopics);

  const aliceIdentity = await deployIdentityProxy(identityImplementationAuthority.address, aliceWallet.address, deployer);
  const bobIdentity = await deployIdentityProxy(identityImplementationAuthority.address, bobWallet.address, deployer);
  const daveIdentity = await deployIdentityProxy(identityImplementationAuthority.address, daveWallet.address, deployer);

  await identityRegistry.connect(deployer).addAgent(tokenAgent.address);
  await identityRegistry.connect(deployer).addAgent(token.address);

  await identityRegistry
    .connect(tokenAgent)
    .batchRegisterIdentity(
      [aliceWallet.address, bobWallet.address, daveWallet.address],
      [aliceIdentity.address, bobIdentity.address, daveIdentity.address],
      [42, 666, 42],
    );

  async function addClaimFor(identity: any, wallet: any) {
    const claim = {
      data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('KYC ok')),
      issuer: claimIssuerContract.address,
      topic: claimTopics[0],
      scheme: 1,
      identity: identity.address,
      signature: '',
    };
    claim.signature = await claimIssuerSigningKey.signMessage(
      ethers.utils.arrayify(
        ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'bytes'], [claim.identity, claim.topic, claim.data])),
      ),
    );
    await identity.connect(wallet).addClaim(claim.topic, claim.scheme, claim.issuer, claim.signature, claim.data, '');
  }

  await addClaimFor(aliceIdentity, aliceWallet);
  await addClaimFor(bobIdentity, bobWallet);
  await addClaimFor(daveIdentity, daveWallet);

  await token.connect(tokenAgent).mint(aliceWallet.address, ethers.utils.parseUnits('1000', 18));
  await token.connect(tokenAgent).unpause();

  const manifest = {
    tokenAddress: token.address,
    complianceAddress: compliance.address,
    identityRegistryAddress: identityRegistry.address,
    countryAllowModuleAddress: countryAllowModule.address,
    accounts: {
      deployer: deployer.address,
      tokenAgent: tokenAgent.address,
      alice: aliceWallet.address,
      bob: bobWallet.address,
      charlie: charlieWallet.address,
      dave: daveWallet.address,
    },
  };
  fs.writeFileSync('/tmp/trex-manifest.json', JSON.stringify(manifest, null, 2));
  console.log('===MANIFEST_START===');
  console.log(JSON.stringify(manifest, null, 2));
  console.log('===MANIFEST_END===');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
