const { LocalNode } = require("../src/cli");

module.exports = async function setup() {
  console.log("result");
  const localNode = new LocalNode();
  console.log("localNode",localNode);
  globalThis.__LOCAL_NODE__ = localNode;
  console.log("globalThis.__LOCAL_NODE__ ",globalThis.__LOCAL_NODE__ );
  await localNode.run();
};