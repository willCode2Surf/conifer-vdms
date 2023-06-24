const { Organization } = require("../models/organization");

async function addToDemo(user) {
  const demoOrg = await Organization.findByUid('demo');
  if (!demoOrg) {
    await createDemoOrg(user);
    return;
  }
  if (demoOrg.admins.includes(user.uid)) return;

  await Organization.updateQuick('demo', {
    admins: [...demoOrg.admins, user.uid]
  });
  return;
}

async function createDemoOrg(user) {
  await Organization.createDemo(user.uid, {
    name: "Demo Organization"
  });
}

module.exports = {
  addToDemo,
}