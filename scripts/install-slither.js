import { execSync } from "child_process";

function hasSlither() {
  try {
    execSync("slither --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function installSlither() {
  const pip = process.env.PIP_PATH || "pip3";
  execSync(`${pip} install slither-analyzer`, { stdio: "inherit" });
}

if (!hasSlither()) {
  try {
    installSlither();
  } catch (err) {
    console.error("Failed to install Slither:", err);
  }
}
