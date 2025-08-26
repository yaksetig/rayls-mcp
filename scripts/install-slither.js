import { execSync } from "child_process";

console.log("🔍 Starting Slither installation check...");
console.log("🔧 Environment:", process.platform, process.arch);

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description}: SUCCESS`);
    console.log(result.trim());
    return true;
  } catch (error) {
    console.log(`❌ ${description}: FAILED`);
    console.log("Error code:", error.status);
    console.log("STDOUT:", error.stdout?.toString() || 'none');
    console.log("STDERR:", error.stderr?.toString() || 'none');
    return false;
  }
}

// Check if commands exist
runCommand("which python3", "Checking Python3");
runCommand("python3 --version", "Python3 version");

// Check for virtual environment
const venvPython = "/opt/venv/bin/python";
const venvPip = "/opt/venv/bin/pip";
const venvSlither = "/opt/venv/bin/slither";

if (runCommand(`ls -la ${venvPython}`, "Checking venv Python")) {
  runCommand(`${venvPython} --version`, "Venv Python version");
}

if (runCommand(`ls -la ${venvPip}`, "Checking venv pip")) {
  runCommand(`${venvPip} --version`, "Venv pip version");
}

// Check if slither already exists in venv
if (runCommand(`ls -la ${venvSlither}`, "Checking venv Slither")) {
  runCommand(`${venvSlither} --version`, "Venv Slither version");
  console.log("✅ Slither already installed in virtual environment!");
  process.exit(0);
}

// Check regular PATH
if (runCommand("which slither", "Checking PATH Slither")) {
  runCommand("slither --version", "PATH Slither version");
  console.log("✅ Slither found in PATH!");
  process.exit(0);
}

console.log("\n📦 Installing Slither in virtual environment...");

if (runCommand(`${venvPip} install --upgrade pip`, "Upgrading pip in venv")) {
  if (runCommand(`${venvPip} install slither-analyzer`, "Installing Slither in venv")) {
    console.log("\n🎉 Slither installation completed!");
    
    // Verify installation
    if (runCommand(`${venvSlither} --version`, "Final venv Slither verification")) {
      console.log("✅ All checks passed!");
    } else {
      console.log("❌ Slither installed but verification failed");
      process.exit(1);
    }
  } else {
    console.log("❌ Failed to install Slither in virtual environment");
    process.exit(1);
  }
} else {
  console.log("❌ Failed to upgrade pip in virtual environment");
  process.exit(1);
}
