export const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function paused() view returns (bool)",
  "function isFrozen(address) view returns (bool)",
  "function getFrozenTokens(address) view returns (uint256)",
  "function identityRegistry() view returns (address)",
  "function compliance() view returns (address)",
];

export const REGISTRY_ABI = [
  "function isVerified(address) view returns (bool)",
  "function identity(address) view returns (address)",
  "function investorCountry(address) view returns (uint16)",
];

export const COMPLIANCE_ABI = [
  "function canTransfer(address _from, address _to, uint256 _amount) view returns (bool)",
  "function getModules() view returns (address[])",
];

export const MODULE_ABI = [
  "function name() view returns (string)",
  "function moduleCheck(address _from, address _to, uint256 _value, address _compliance) view returns (bool)",
];
