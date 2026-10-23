
// Get elements from the page
const passwordInput = document.getElementById("password");
const lengthSlider = document.getElementById("length");
const lengthValue = document.getElementById("length-value");
const generateBtn = document.getElementById("generate-btn");
const copyBtn = document.getElementById("copy-btn");
const message = document.getElementById("message");

// Character sets
const characterSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{};:,.<>?"
};

// Update the displayed password length
lengthSlider.addEventListener("input", () => {
  lengthValue.textContent = lengthSlider.value;
  message.textContent = "";
});

// Return a secure random integer from 0 to max - 1.
// Rejection sampling avoids modulo bias.
function secureRandomInt(max) {
  const range = 0x100000000;
  const limit = range - (range % max);
  const randomValues = new Uint32Array(1);

  do {
    crypto.getRandomValues(randomValues);
  } while (randomValues[0] >= limit);

  return randomValues[0] % max;
}

// Pick a random character from a string
function randomCharacter(characters) {
  return characters[secureRandomInt(characters.length)];
}

// Generate a password
function generatePassword() {
  const length = Number(lengthSlider.value);
  const selectedSets = [];

  // Collect the selected character types
  for (const [id, characters] of Object.entries(characterSets)) {
    if (document.getElementById(id).checked) {
      selectedSets.push(characters);
    }
  }

  // Validate the user's selections
  if (selectedSets.length === 0) {
    passwordInput.value = "";
    message.textContent =
      "Please select at least one character type.";
    message.style.color = "#dc2626";
    return;
  }

  if (!Number.isInteger(length) || length < 8 || length > 32) {
    message.textContent =
      "Please choose a length between 8 and 32.";
    message.style.color = "#dc2626";
    return;
  }

  // Start with one character from each selected set
  const passwordCharacters = selectedSets.map(
    (characters) => randomCharacter(characters)
  );

  // Combine all selected character sets
  const allCharacters = selectedSets.join("");

  // Fill the remaining password length
  while (passwordCharacters.length < length) {
    passwordCharacters.push(randomCharacter(allCharacters));
  }

  // Shuffle the characters using Fisher-Yates
  for (let i = passwordCharacters.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);

    [passwordCharacters[i], passwordCharacters[j]] =
      [passwordCharacters[j], passwordCharacters[i]];
  }

  // Display the generated password
  passwordInput.value = passwordCharacters.join("");
  message.textContent = "";
  message.style.color = "#15803d";
  copyBtn.textContent = "Copy";
}

// Copy the password to the clipboard
async function copyPassword() {
  const password = passwordInput.value;

  if (!password) {
    message.style.color = "#dc2626";
    message.textContent = "Generate a password first.";
    return;
  }

  try {
    // Use the modern clipboard API when available
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(password);
    } else {
      // Fallback for older browsers or local file contexts
      const temporaryInput = document.createElement("textarea");
      temporaryInput.value = password;
      temporaryInput.setAttribute("readonly", "");
      temporaryInput.style.position = "fixed";
      temporaryInput.style.left = "-9999px";
      document.body.appendChild(temporaryInput);
      temporaryInput.select();

      const copied = document.execCommand("copy");
      temporaryInput.remove();

      if (!copied) {
        throw new Error("Copy command failed");
      }
    }

    message.style.color = "#15803d";
    message.textContent = "Password copied to clipboard!";
    copyBtn.textContent = "Copied!";
  } catch (error) {
    message.style.color = "#dc2626";
    message.textContent =
      "Copy failed. Please select and copy the password manually.";
    copyBtn.textContent = "Copy";
  }
}

// Clear outdated messages when options change
document.querySelectorAll(".option input").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    message.textContent = "";
    copyBtn.textContent = "Copy";
  });
});

// Clear the copied message when generating a new password
generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);

// Generate an initial password when the page loads
generatePassword();
