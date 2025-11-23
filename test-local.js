const { ethers } = require("hardhat");

async function testLocalDeployment() {
    console.log("🧪 Test des contrats déployés en local...\n");

    // Adresses des contrats déployés
    const TOKEN_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

    // Récupérer le signataire
    const [signer] = await ethers.getSigners();
    console.log("👤 Compte de test:", signer.address);
    console.log("💰 Balance ETH:", ethers.formatEther(await signer.provider.getBalance(signer.address)), "ETH\n");

    // Connecter au contrat token
    const token = await ethers.getContractAt("MaxToken42", TOKEN_ADDRESS);

    // Tests du token
    console.log("🪙 Informations du token:");
    console.log("  - Nom:", await token.name());
    console.log("  - Symbole:", await token.symbol());
    console.log("  - Décimales:", await token.decimals());
    console.log("  - Supply totale:", ethers.formatEther(await token.totalSupply()), "MTK42");
    console.log("  - Balance du deployer:", ethers.formatEther(await token.balanceOf(signer.address)), "MTK42\n");

    // Test de transfert
    console.log("🔄 Test de transfert...");
    const [, recipient] = await ethers.getSigners();
    const transferAmount = ethers.parseEther("1000"); // 1000 MTK42

    try {
        const tx = await token.transfer(recipient.address, transferAmount);
        await tx.wait();
        console.log("  ✅ Transfert réussi!");
        console.log("  - Balance recipient:", ethers.formatEther(await token.balanceOf(recipient.address)), "MTK42");
    } catch (error) {
        console.log("  ❌ Transfert échoué:", error.message);
    }

    console.log("\n🎉 Tests terminés!");
}

// Exécuter si le script est appelé directement
if (require.main === module) {
    testLocalDeployment()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Erreur:", error);
            process.exit(1);
        });
}

module.exports = { testLocalDeployment };