#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { JsonRpcProvider } from "ethers";
import { readFileSync } from "node:fs";
import { diagnose, type Finding } from "./onchain/diagnose.js";
import { runScenarios, type ScenarioCase } from "./onchain/scenarioRunner.js";

function render(findings: Finding[]) {
  let currentStage = "";
  for (const f of findings) {
    if (f.stage !== currentStage) {
      currentStage = f.stage;
      console.log(`\n  ${currentStage.toUpperCase()}`);
    }
    const mark = f.ok ? "  ok  " : "  KO  ";
    console.log(`${mark}${f.label}${f.detail ? `  — ${f.detail}` : ""}`);
  }
  const blockers = findings.filter((f) => !f.ok && f.stage !== "verdict");
  console.log("");
  if (blockers.length === 0) {
    console.log("Aucun blocage détecté.");
  } else {
    console.log(`Bloqué par : ${blockers.map((b) => b.label).join(", ")}`);
  }
}

const program = new Command();
program.name("sim").description("Simulateur de règles de conformité ERC-3643").version("0.1.0");

program
  .command("diagnose")
  .description("Explique pourquoi un transfert passe ou ne passe pas")
  .requiredOption("--from <address>")
  .requiredOption("--to <address>")
  .requiredOption("--amount <units>", "montant en unités entières du token")
  .action(async (opts) => {
    const provider = new JsonRpcProvider(process.env.RPC_URL);
    const token = process.env.TOKEN_ADDRESS!;
    const { findings } = await diagnose(provider, token, opts.from, opts.to, BigInt(opts.amount));
    render(findings);
  });

program
  .command("scenario")
  .description("Rejoue un fichier de cas et compare au résultat attendu")
  .requiredOption("--file <path>", "fichier JSON de scénarios")
  .action(async (opts) => {
    const provider = new JsonRpcProvider(process.env.RPC_URL);
    const token = process.env.TOKEN_ADDRESS!;
    const cases: ScenarioCase[] = JSON.parse(readFileSync(opts.file, "utf8"));

    const { results, summary } = await runScenarios(provider, token, cases);
    for (const r of results) {
      console.log(
        `${r.pass ? "PASS" : "FAIL"}  ${r.name}` + (r.blockers.length ? `  [${r.blockers.join(", ")}]` : "")
      );
    }
    console.log(`\n${summary.passed}/${summary.total} conformes aux attentes.`);
    if (summary.passed < summary.total) process.exit(1);
  });

program.parseAsync(process.argv).catch((e) => {
  console.error(`\nErreur : ${e.message}`);
  process.exit(1);
});
